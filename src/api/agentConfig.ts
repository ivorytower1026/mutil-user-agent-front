import api from './client'
import type { 
  AgentConfig, 
  AllConfigsResponse,
  MainAgentConfigUpdate,
  SubagentCreate,
  SubagentUpdate 
} from '@/types/agentConfig'

const BASE = '/api/admin/agents'

export const agentConfigApi = {
  async getAll(): Promise<AllConfigsResponse> {
    const response = await api.get<AllConfigsResponse>(BASE)
    return response.data
  },

  async updateMain(data: MainAgentConfigUpdate): Promise<AgentConfig> {
    const response = await api.put<AgentConfig>(`${BASE}/main`, data)
    return response.data
  },

  async createSubagent(data: SubagentCreate): Promise<AgentConfig> {
    const response = await api.post<AgentConfig>(`${BASE}/subagents`, data)
    return response.data
  },

  async getSubagent(name: string): Promise<AgentConfig> {
    const response = await api.get<AgentConfig>(`${BASE}/subagents/${name}`)
    return response.data
  },

  async updateSubagent(name: string, data: SubagentUpdate): Promise<AgentConfig> {
    const response = await api.put<AgentConfig>(`${BASE}/subagents/${name}`, data)
    return response.data
  },

  async deleteSubagent(name: string): Promise<void> {
    await api.delete(`${BASE}/subagents/${name}`)
  },

  async reload(): Promise<void> {
    await api.post(`${BASE}/reload`)
  }
}
