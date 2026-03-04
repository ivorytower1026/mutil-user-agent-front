export type SSEEventName = 
  | 'messages/partial'
  | 'tool/start'
  | 'tool/end'
  | 'interrupt'
  | 'title_updated'
  | 'todos_updated'
  | 'error'
  | 'end'

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

export interface Todo {
  content: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface SSEEvent {
  event: SSEEventName
  content?: string
  is_final?: boolean
  tool?: string
  status?: 'running' | 'completed'
  info?: string
  message?: string
  data?: Record<string, unknown>
  title?: string
  questions?: Question[]
  todos?: Todo[]
  
  namespace?: string[]
  subagent_id?: string
  subagent_name?: string
}
