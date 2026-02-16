export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  message: string
  user_id: string
}

export interface CreateSessionResponse {
  thread_id: string
}

export interface ThreadStatus {
  thread_id: string
  status: 'idle' | 'interrupted'
  has_pending_tasks: boolean
  interrupt_info: InterruptInfo | null
  message_count: number
}

export interface InterruptInfo {
  task_name: string
  interrupts: string[]
}

export interface HistoryResponse {
  thread_id: string
  messages: ApiMessage[]
}

export interface ApiMessage {
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
}

export interface ResumeRequest {
  action: string
  answers?: string[]
}

export interface ThreadListItem {
  thread_id: string
  title: string | null
  created_at: string
  message_count: number
  status: 'idle' | 'interrupted'
}

export interface ThreadListResponse {
  threads: ThreadListItem[]
  total: number
}
