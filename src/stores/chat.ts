import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, Interrupt, AgentMode, Todo, ToolCall, SubagentEvent } from '@/types/chat'
import { chatApi } from '@/api'
import { isSubagentHistoryMessage } from '@/utils/subagent'

const DEFAULT_MODE: AgentMode = 'build'
const STORAGE_KEY = 'agent_mode'

function getStoredMode(): AgentMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'plan' || stored === 'build') {
    return stored
  }
  return DEFAULT_MODE
}

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
  const mode = ref<AgentMode>(getStoredMode())
  const currentSubagentId = ref<string | null>(null)
  const currentSubagentName = ref<string | null>(null)

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
      streamingContent.value += '\n'
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

  function addToolCall(toolCall: { name: string; todos?: Todo[] }) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      if (!lastMessage.toolCalls) {
        lastMessage.toolCalls = []
      }
      
      // write_todos 特殊处理：更新现有的而不是创建新的
      if (toolCall.name === 'write_todos' && toolCall.todos) {
        const existingTodo = lastMessage.toolCalls.find(tc => tc.name === 'write_todos')
        if (existingTodo) {
          existingTodo.todos = toolCall.todos
          existingTodo.status = 'running'
          return
        }
      }
      
      lastMessage.toolCalls.push({
        id: generateId(),
        name: toolCall.name,
        status: 'running',
        timestamp: new Date(),
        todos: toolCall.todos
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
    currentSubagentId.value = null
    currentSubagentName.value = null
  }

  function startSubagent(subagentId: string, subagentName: string) {
    currentSubagentId.value = subagentId
    currentSubagentName.value = subagentName
  }

  function endSubagent() {
    currentSubagentId.value = null
    currentSubagentName.value = null
  }

  function addSubagentEvent(event: SubagentEvent) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      if (!lastMessage.subagentEvents) {
        lastMessage.subagentEvents = []
      }
      lastMessage.subagentEvents.push(event)
      lastMessage.isSubagent = true
      lastMessage.subagentId = currentSubagentId.value || undefined
      lastMessage.subagentName = currentSubagentName.value || undefined
    }
  }

  function toggleSubagentCollapse(messageId: string) {
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.collapsed = !message.collapsed
    }
  }

  function setMode(newMode: AgentMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
  }

async function loadHistory(threadId: string) {
    try {
      const response = await chatApi.getHistory(threadId)
      messages.value = response.messages.map((msg, index) => {
        const formattedMsg: Message = {
          id: `history-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }
        
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          formattedMsg.toolCalls = msg.toolCalls.map((tc: any, tcIndex: number) => ({
            id: `history-${index}-tool-${tcIndex}`,
            name: tc.name,
            status: tc.status || 'completed',
            timestamp: new Date(),
            todos: tc.todos
          })) as ToolCall[]
        }

        if (isSubagentHistoryMessage(msg)) {
          formattedMsg.isSubagent = true
          formattedMsg.subagentName = msg.subagent_name || 'Unknown Subagent'
          formattedMsg.collapsed = true
        }
        
        return formattedMsg
      })
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
    mode,
    currentSubagentId,
    currentSubagentName,
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
    markSegmentEnd,
    setMode,
    startSubagent,
    endSubagent,
    addSubagentEvent,
    toggleSubagentCollapse
  }
})
