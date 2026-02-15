export type SSEEventName = 
  | 'messages/partial'
  | 'tool/start'
  | 'tool/end'
  | 'interrupt'
  | 'title_updated'
  | 'error'
  | 'end'

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
}
