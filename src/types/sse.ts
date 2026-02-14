export type SSEEventName = 
  | 'messages/partial'
  | 'tool/start'
  | 'tool/end'
  | 'interrupt'
  | 'title_updated'
  | 'updates'
  | 'error'
  | 'end'

export interface SSEEvent {
  event: SSEEventName
  content?: string
  is_final?: boolean
  tool?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  info?: string
  message?: string
  data?: Record<string, unknown>
  title?: string
}
