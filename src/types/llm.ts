export type LlmProvider = 'ollama' | 'vllm' | 'openai' | 'zhipuai'
export type LlmRole = 'big' | 'flash' | 'embedding'

export interface LlmConfig {
  id: string
  name: string
  display_name?: string
  description?: string
  provider: LlmProvider
  base_url: string
  model_name: string
  temperature: number
  max_tokens: number
  extra_params: Record<string, unknown>
  role: LlmRole
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface LlmConfigCreate {
  name: string
  display_name?: string
  description?: string
  provider: LlmProvider
  base_url: string
  api_key: string
  model_name: string
  temperature?: number
  max_tokens?: number
  extra_params?: Record<string, unknown>
  role: LlmRole
  activate?: boolean
}

export interface LlmConfigUpdate {
  display_name?: string
  description?: string
  base_url?: string
  api_key?: string
  model_name?: string
  temperature?: number
  max_tokens?: number
  extra_params?: Record<string, unknown>
}

export interface LlmTestRequest {
  base_url: string
  api_key: string
  model_name: string
}

export interface LlmTestResult {
  success: boolean
  message: string
  response_time_ms?: number
  response_preview?: string
  vector_dim?: number
  vector_preview?: number[]
}

export interface LlmConfigListResponse {
  configs: LlmConfig[]
  total: number
}

export const PROVIDER_DEFAULT_URLS: Record<LlmProvider, string> = {
  ollama: 'http://localhost:11434/v1',
  vllm: 'http://localhost:8000/v1',
  openai: 'https://api.openai.com/v1',
  zhipuai: 'https://open.bigmodel.cn/api/paas/v4'
}

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  ollama: 'Ollama',
  vllm: 'VLLM',
  openai: 'OpenAI',
  zhipuai: '智谱AI'
}

export const ROLE_LABELS: Record<LlmRole, string> = {
  big: '主模型',
  flash: '快速模型',
  embedding: 'Embedding'
}
