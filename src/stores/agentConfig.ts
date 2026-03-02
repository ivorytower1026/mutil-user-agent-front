import { defineStore } from 'pinia'
import { ref } from 'vue'
import { agentConfigApi } from '@/api/agentConfig'
import type { AgentConfig, MainAgentConfigUpdate, SubagentCreate, SubagentUpdate } from '@/types/agentConfig'

export const useAgentConfigStore = defineStore('agentConfig', () => {
  const mainConfig = ref<AgentConfig | null>(null)
  const subagents = ref<AgentConfig[]>([])
  const isLoading = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      const response = await agentConfigApi.getAll()
      mainConfig.value = response.main
      subagents.value = response.subagents
    } finally {
      isLoading.value = false
    }
  }

  async function updateMain(data: MainAgentConfigUpdate) {
    const config = await agentConfigApi.updateMain(data)
    mainConfig.value = config
    return config
  }

  async function createSubagent(data: SubagentCreate) {
    const config = await agentConfigApi.createSubagent(data)
    await fetchAll()
    return config
  }

  async function updateSubagent(name: string, data: SubagentUpdate) {
    const config = await agentConfigApi.updateSubagent(name, data)
    await fetchAll()
    return config
  }

  async function deleteSubagent(name: string) {
    await agentConfigApi.deleteSubagent(name)
    await fetchAll()
  }

  async function reload() {
    await agentConfigApi.reload()
    await fetchAll()
  }

  return {
    mainConfig,
    subagents,
    isLoading,
    fetchAll,
    updateMain,
    createSubagent,
    updateSubagent,
    deleteSubagent,
    reload
  }
})
