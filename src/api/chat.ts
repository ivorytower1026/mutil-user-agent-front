import api from './client'
import type { CreateSessionResponse, ThreadStatus, HistoryResponse } from '@/types/api'

export const chatApi = {
  async createSession(): Promise<CreateSessionResponse> {
    const response = await api.post<CreateSessionResponse>('/api/sessions')
    return response.data
  },

  async getStatus(threadId: string): Promise<ThreadStatus> {
    const response = await api.get<ThreadStatus>(`/api/status/${threadId}`)
    return response.data
  },

  async getHistory(threadId: string): Promise<HistoryResponse> {
    const response = await api.get<HistoryResponse>(`/api/history/${threadId}`)
    return response.data
  }
}
