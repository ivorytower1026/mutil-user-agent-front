export type SSEEventType = 
  | 'content' 
  | 'tool_start' 
  | 'tool_end' 
  | 'interrupt' 
  | 'done' 
  | 'error'
  | 'update'

export interface SSEEvent {
  type: SSEEventType
  content?: string
  is_final?: boolean
  tool?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  info?: string
  message?: string
  data?: Record<string, unknown>
}
