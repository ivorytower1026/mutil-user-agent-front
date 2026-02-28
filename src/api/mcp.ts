import api from './client'
import type { 
  McpServer, 
  McpServerCreate, 
  McpServerUpdate,
  McpServerListResponse,
  McpTestResult,
  McpTool 
} from '@/types/mcp'

const BASE = '/api/admin/mcp'

export const mcpApi = {
  async list(): Promise<McpServerListResponse> {
    const response = await api.get<McpServerListResponse>(BASE)
    return response.data
  },

  async get(name: string): Promise<McpServer> {
    const response = await api.get<McpServer>(`${BASE}/${name}`)
    return response.data
  },

  async create(data: McpServerCreate): Promise<McpServer> {
    const response = await api.post<McpServer>(BASE, data)
    return response.data
  },

  async update(name: string, data: McpServerUpdate): Promise<McpServer> {
    const response = await api.put<McpServer>(`${BASE}/${name}`, data)
    return response.data
  },

  async delete(name: string): Promise<void> {
    await api.delete(`${BASE}/${name}`)
  },

  async test(name: string): Promise<McpTestResult> {
    const response = await api.post<McpTestResult>(`${BASE}/${name}/test`)
    return response.data
  },

  async listTools(name: string): Promise<McpTool[]> {
    const response = await api.get<McpTool[]>(`${BASE}/${name}/tools`)
    return response.data
  },

  async reload(): Promise<void> {
    await api.post(`${BASE}/reload`)
  }
}
