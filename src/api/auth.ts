import api from './client'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/api'

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/api/auth/register', data)
    return response.data
  }
}
