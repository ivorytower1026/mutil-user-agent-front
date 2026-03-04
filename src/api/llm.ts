import api from './client'
import type { 
  LlmConfig, 
  LlmConfigCreate, 
  LlmConfigUpdate,
  LlmConfigListResponse,
  LlmTestRequest,
  LlmTestResult
} from '@/types/llm'

const BASE = '/api/admin/llm'

export const llmApi = {
  async list(params?: { role?: string; provider?: string }): Promise<LlmConfigListResponse> {
    const response = await api.get<LlmConfigListResponse>(`${BASE}/configs`, { params })
    return response.data
  },

  async get(id: string): Promise<LlmConfig> {
    const response = await api.get<LlmConfig>(`${BASE}/configs/${id}`)
    return response.data
  },

  async create(data: LlmConfigCreate): Promise<LlmConfig> {
    const response = await api.post<LlmConfig>(`${BASE}/configs`, data)
    return response.data
  },

  async update(id: string, data: LlmConfigUpdate): Promise<LlmConfig> {
    const response = await api.put<LlmConfig>(`${BASE}/configs/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE}/configs/${id}`)
  },

  async activate(id: string): Promise<LlmConfig> {
    const response = await api.post<LlmConfig>(`${BASE}/configs/${id}/activate`)
    return response.data
  },

  async test(data: LlmTestRequest): Promise<LlmTestResult> {
    const response = await api.post<LlmTestResult>(`${BASE}/test`, data)
    return response.data
  },

  async testEmbedding(data: LlmTestRequest): Promise<LlmTestResult> {
    const response = await api.post<LlmTestResult>(`${BASE}/embedding/test`, data)
    return response.data
  },

  async testConfig(id: string): Promise<LlmTestResult> {
    const response = await api.post<LlmTestResult>(`${BASE}/configs/${id}/test`)
    return response.data
  }
}
