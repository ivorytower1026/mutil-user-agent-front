import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { streamChat, streamResume } from '@/api/sse'
import type { SSEEvent } from '@/types/sse'

export function useChatStream() {
  const chatStore = useChatStore()
  const sessionStore = useSessionStore()
  const abortController = ref<AbortController | null>(null)

  async function sendMessage(threadId: string, message: string) {
    if (!message.trim()) return

    chatStore.setLoading(true)
    chatStore.setError(null)
    chatStore.addUserMessage(message)
    chatStore.startAssistantMessage()
    sessionStore.incrementMessageCount(threadId)

    abortController.value = new AbortController()

    try {
      for await (const event of streamChat(threadId, message, abortController.value.signal)) {
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

  async function resumeInterrupt(threadId: string, action: 'continue' | 'cancel') {
    chatStore.setLoading(true)
    chatStore.clearInterrupt()
    
    abortController.value = new AbortController()

    try {
      for await (const event of streamResume(threadId, action, abortController.value.signal)) {
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
        chatStore.setInterrupt({
          taskName: 'Unknown',
          info: event.info || '',
          data: event.data || { ...event }
        })
        if (sessionStore.currentThreadId) {
          sessionStore.updateSessionStatus(sessionStore.currentThreadId, 'interrupted')
        }
        break

      case 'title_updated':
        if (event.title && sessionStore.currentThreadId) {
          sessionStore.updateThreadTitle(sessionStore.currentThreadId, event.title)
        }
        break

      case 'error':
        chatStore.setError(event.message || 'Unknown error')
        break

      case 'end':
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
    stopStream
  }
}
