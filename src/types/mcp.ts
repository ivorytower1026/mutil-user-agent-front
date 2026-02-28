export type McpTransport = 'stdio' | 'http' | 'sse'

export interface McpServer {
  id: string
  name: string
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface McpServerCreate {
  name: string
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled?: boolean
}

export interface McpServerUpdate {
  transport?: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled?: boolean
}

export interface McpTool {
  name: string
  description: string
}

export interface McpTestResult {
  success: boolean
  tools_count?: number
  tools?: McpTool[]
  error?: string
}

export interface McpServerListResponse {
  servers: McpServer[]
  total: number
}
