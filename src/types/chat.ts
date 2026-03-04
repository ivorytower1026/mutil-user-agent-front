export type AgentMode = 'plan' | 'build'

export interface Todo {
  content: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  
  isSubagent?: boolean
  subagentId?: string
  subagentName?: string
  collapsed?: boolean
}

export interface ToolCall {
  id: string
  name: string
  status: 'running' | 'completed'
  timestamp: Date
  todos?: Todo[]
}

export interface InterruptOption {
  id: string
  label: string
  description?: string
  icon?: string
}

export interface QuestionOption {
  label: string
  value: string
  allow_custom?: boolean
}

export interface Question {
  question: string
  options: QuestionOption[]
  allow_custom?: boolean
}

export interface Interrupt {
  taskName: string
  info: string
  data?: Record<string, unknown>
  options?: InterruptOption[]
  questions?: Question[]
}

export interface Session {
  threadId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  status: 'idle' | 'interrupted'
  title?: string
}
