import api from './client'
import type {
  SkillListResponse,
  SkillDetail,
  UploadResponse,
  ApproveResponse,
  RejectResponse,
  FullTestResponse
} from '@/types/admin'

const BASE = '/api/admin'

export const adminApi = {
  async uploadSkill(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<UploadResponse>(`${BASE}/skills/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async getSkills(params: {
    status?: string
    validation_stage?: string
    page?: number
    size?: number
  } = {}): Promise<SkillListResponse> {
    const response = await api.get<SkillListResponse>(`${BASE}/skills`, { params })
    return response.data
  },

  async getSkill(skillId: string): Promise<SkillDetail> {
    const response = await api.get<SkillDetail>(`${BASE}/skills/${skillId}`)
    return response.data
  },

  async getSkillReport(skillId: string): Promise<string> {
    const response = await api.get<string>(`${BASE}/skills/${skillId}/report`, {
      headers: { Accept: 'text/markdown' }
    })
    return response.data
  },

  async approveSkill(skillId: string): Promise<ApproveResponse> {
    const response = await api.post<ApproveResponse>(`${BASE}/skills/${skillId}/approve`)
    return response.data
  },

  async rejectSkill(skillId: string, reason: string): Promise<RejectResponse> {
    const response = await api.post<RejectResponse>(`${BASE}/skills/${skillId}/reject`, { reason })
    return response.data
  },

  async revalidateSkill(skillId: string): Promise<{ skill_id: string; status: string; validation_stage: string; message: string }> {
    const response = await api.post(`${BASE}/skills/${skillId}/revalidate`)
    return response.data
  },

  async deleteSkill(skillId: string): Promise<{ skill_id: string; status: string; message: string }> {
    const response = await api.delete(`${BASE}/skills/${skillId}`)
    return response.data
  },

  async fullTest(): Promise<FullTestResponse> {
    const response = await api.post<FullTestResponse>(`${BASE}/skills/full-test`)
    return response.data
  }
}
