export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  status: 'running' | 'completed'
  timestamp: Date
}

export interface InterruptOption {
  id: string
  label: string
  description?: string
  icon?: string
}

export interface Interrupt {
  taskName: string
  info: string
  data?: Record<string, unknown>
  options?: InterruptOption[]
}

export interface Session {
  threadId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  status: 'idle' | 'interrupted'
  title?: string
}
