import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mcpApi } from '@/api/mcp'
import type { McpServer, McpServerCreate, McpServerUpdate, McpTestResult, McpTool } from '@/types/mcp'

export const useMcpStore = defineStore('mcp', () => {
  const servers = ref<McpServer[]>([])
  const isLoading = ref(false)
  const total = ref(0)

  async function fetchServers() {
    isLoading.value = true
    try {
      const response = await mcpApi.list()
      servers.value = response.servers
      total.value = response.total
    } finally {
      isLoading.value = false
    }
  }

  async function createServer(data: McpServerCreate) {
    const server = await mcpApi.create(data)
    await fetchServers()
    return server
  }

  async function updateServer(name: string, data: McpServerUpdate) {
    const server = await mcpApi.update(name, data)
    await fetchServers()
    return server
  }

  async function deleteServer(name: string) {
    await mcpApi.delete(name)
    await fetchServers()
  }

  async function testConnection(name: string): Promise<McpTestResult> {
    return await mcpApi.test(name)
  }

  async function listTools(name: string): Promise<McpTool[]> {
    return await mcpApi.listTools(name)
  }

  async function reload() {
    await mcpApi.reload()
    await fetchServers()
  }

  return {
    servers,
    isLoading,
    total,
    fetchServers,
    createServer,
    updateServer,
    deleteServer,
    testConnection,
    listTools,
    reload
  }
})
