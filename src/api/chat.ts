import api from './client'
import type { CreateSessionResponse, ThreadStatus, HistoryResponse, ThreadListResponse } from '@/types/api'
import type { UploadSimpleResponse } from '@/types/file'

export const chatApi = {
  async createSession(): Promise<CreateSessionResponse> {
    const response = await api.post<CreateSessionResponse>('/api/sessions')
    return response.data
  },

  async getSessions(page: number = 1, pageSize: number = 20): Promise<ThreadListResponse> {
    const response = await api.get<ThreadListResponse>('/api/sessions', {
      params: { page, page_size: pageSize }
    })
    return response.data
  },

  async getStatus(threadId: string): Promise<ThreadStatus> {
    const response = await api.get<ThreadStatus>(`/api/status/${threadId}`)
    return response.data
  },

async getHistory(threadId: string): Promise<HistoryResponse> {
    const response = await api.get<HistoryResponse>(`/api/history/${threadId}`)
    return response.data
  },

  async uploadSimple(file: File): Promise<UploadSimpleResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<UploadSimpleResponse>('/api/files/upload-simple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}
