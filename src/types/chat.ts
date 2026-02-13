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
  args: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: unknown
  timestamp: Date
}

export interface Interrupt {
  taskName: string
  info: string
  data?: Record<string, unknown>
}

export interface Session {
  threadId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  status: 'idle' | 'interrupted'
  title?: string
}
