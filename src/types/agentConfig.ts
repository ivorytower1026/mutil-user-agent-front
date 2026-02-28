export interface AgentConfig {
  id: string
  name: string
  is_main: boolean
  description?: string
  system_prompt?: string
  mcp_tools: string[]
  skills: string[]
  subagents: string[]
  model?: string
}

export interface MainAgentConfigUpdate {
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  subagents?: string[]
}

export interface SubagentCreate {
  name: string
  description?: string
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  model?: string
}

export interface SubagentUpdate {
  description?: string
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  model?: string
}

export interface AllConfigsResponse {
  main: AgentConfig
  subagents: AgentConfig[]
}
