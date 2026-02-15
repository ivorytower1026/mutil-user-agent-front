import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, Interrupt } from '@/types/chat'
import { chatApi } from '@/api'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const interrupt = ref<Interrupt | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const streamingContent = ref('')
  const needsNewline = ref(false)

  function addUserMessage(content: string) {
    messages.value.push({
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    })
  }

  function startAssistantMessage() {
    streamingContent.value = ''
    needsNewline.value = false
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    })
  }

  function appendAssistantContent(chunk: string) {
    if (needsNewline.value && streamingContent.value) {
      streamingContent.value += '\n\n'
      needsNewline.value = false
    }
    streamingContent.value += chunk
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = streamingContent.value
    }
  }

  function markSegmentEnd() {
    needsNewline.value = true
  }

  function addToolCall(toolCall: { name: string }) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      if (!lastMessage.toolCalls) {
        lastMessage.toolCalls = []
      }
      lastMessage.toolCalls.push({
        id: generateId(),
        name: toolCall.name,
        status: 'running',
        timestamp: new Date()
      })
    }
  }

  function completeToolCall(toolName: string) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.toolCalls) {
      const toolCall = lastMessage.toolCalls.find(
        tc => tc.name === toolName && tc.status === 'running'
      )
      if (toolCall) {
        toolCall.status = 'completed'
      }
    }
  }

  function setInterrupt(data: Interrupt) {
    interrupt.value = data
  }

  function clearInterrupt() {
    interrupt.value = null
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function clearMessages() {
    messages.value = []
    streamingContent.value = ''
  }

  async function loadHistory(threadId: string) {
    try {
      const response = await chatApi.getHistory(threadId)
      messages.value = response.messages.map((msg, index) => ({
        id: `history-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      }))
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  return {
    messages,
    interrupt,
    isLoading,
    error,
    streamingContent,
    addUserMessage,
    startAssistantMessage,
    appendAssistantContent,
    addToolCall,
    completeToolCall,
    setInterrupt,
    clearInterrupt,
    setLoading,
    setError,
    clearMessages,
    loadHistory,
    markSegmentEnd
  }
})
