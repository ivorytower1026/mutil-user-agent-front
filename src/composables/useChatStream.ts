import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { streamChat, streamResume } from '@/api/sse'
import { chatApi } from '@/api'
import type { SSEEvent, InterruptOption } from '@/types'
import { MAX_FILE_SIZE, MAX_FILE_COUNT } from '@/types/file'

export interface PendingFile {
  file: File
  path?: string
  status: 'pending' | 'uploading' | 'ready' | 'error'
  error?: string
}

export function useChatStream() {
  const chatStore = useChatStore()
  const sessionStore = useSessionStore()
  const abortController = ref<AbortController | null>(null)
  const pendingFiles = ref<PendingFile[]>([])

  function addFiles(files: File[]) {
    const remaining = MAX_FILE_COUNT - pendingFiles.value.length
    const toAdd = files.slice(0, remaining)
    
    for (const file of toAdd) {
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`文件 ${file.name} 超过 50MB，跳过`)
        continue
      }
      pendingFiles.value.push({
        file,
        status: 'pending'
      })
    }
  }

  function removeFile(index: number) {
    pendingFiles.value.splice(index, 1)
  }

  function clearFiles() {
    pendingFiles.value = []
  }

async function sendMessage(threadId: string, message: string) {
    if (!message.trim() && pendingFiles.value.length === 0) return

    const filePaths: string[] = []
    for (const item of pendingFiles.value) {
      if (item.status === 'ready' && item.path) {
        filePaths.push(item.path)
        continue
      }
      
      item.status = 'uploading'
      try {
        const res = await chatApi.uploadSimple(item.file)
        item.path = res.path
        item.status = 'ready'
        filePaths.push(res.path)
      } catch (e) {
        item.status = 'error'
        item.error = e instanceof Error ? e.message : '上传失败'
      }
    }

    chatStore.setLoading(true)
    chatStore.setError(null)
    chatStore.addUserMessage(message)
    chatStore.startAssistantMessage()
    sessionStore.incrementMessageCount(threadId)

    clearFiles()

    abortController.value = new AbortController()

    try {
      for await (const event of streamChat(threadId, message, filePaths.length > 0 ? filePaths : undefined, abortController.value.signal, chatStore.mode)) {
        handleEvent(event)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        console.log('Stream aborted')
      } else {
        chatStore.setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      chatStore.setLoading(false)
      abortController.value = null
    }
  }

  async function resumeInterrupt(threadId: string, action: string, answers?: string[]) {
    chatStore.setLoading(true)
    chatStore.clearInterrupt()
    
    abortController.value = new AbortController()

    try {
      for await (const event of streamResume(threadId, action, answers, abortController.value.signal)) {
        handleEvent(event)
      }
    } catch (e: unknown) {
      chatStore.setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      chatStore.setLoading(false)
      abortController.value = null
    }
  }

  function handleEvent(event: SSEEvent) {
    switch (event.event) {
      case 'messages/partial':
        if (event.content) {
          chatStore.appendAssistantContent(event.content)
        }
        break

      case 'tool/start':
        if (event.tool) {
          chatStore.addToolCall({
            name: event.tool
          })
        }
        break

      case 'tool/end':
        if (event.tool) {
          chatStore.completeToolCall(event.tool)
        }
        break

      case 'interrupt':
        {
          const data = event.data || {}
          const rawOptions = data.options as InterruptOption[] | undefined
          
          chatStore.setInterrupt({
            taskName: (data.taskName as string) || (data.task_name as string) || 'Unknown',
            info: event.info || (data.info as string) || '',
            data: event.data,
            options: rawOptions?.map(opt => ({
              id: opt.id || String(opt),
              label: opt.label || String(opt),
              description: opt.description,
              icon: opt.icon
            })),
            questions: event.questions,
          })
          if (sessionStore.currentThreadId) {
            sessionStore.updateSessionStatus(sessionStore.currentThreadId, 'interrupted')
          }
        }
        break

      case 'title_updated':
        if (event.title && sessionStore.currentThreadId) {
          sessionStore.updateThreadTitle(sessionStore.currentThreadId, event.title)
        }
        break

      case 'todos_updated':
        if (event.todos) {
          chatStore.addTodoMessage(event.todos)
        }
        break

      case 'error':
        chatStore.setError(event.message || 'Unknown error')
        break

      case 'end':
        chatStore.markSegmentEnd()
        if (sessionStore.currentThreadId) {
          sessionStore.updateSessionStatus(sessionStore.currentThreadId, 'idle')
        }
        break
    }
  }

  function stopStream() {
    if (abortController.value) {
      abortController.value.abort()
    }
  }

return {
    sendMessage,
    resumeInterrupt,
    stopStream,
    pendingFiles,
    addFiles,
    removeFile,
    clearFiles
  }
}
