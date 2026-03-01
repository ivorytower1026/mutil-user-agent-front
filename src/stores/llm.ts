import { defineStore } from 'pinia'
import { ref } from 'vue'
import { llmApi } from '@/api/llm'
import type { LlmConfig, LlmConfigCreate, LlmConfigUpdate, LlmTestRequest, LlmTestResult } from '@/types/llm'

export const useLlmStore = defineStore('llm', () => {
  const configs = ref<LlmConfig[]>([])
  const isLoading = ref(false)
  const total = ref(0)

  async function fetchConfigs(filters?: { role?: string; provider?: string }) {
    isLoading.value = true
    try {
      const response = await llmApi.list(filters)
      configs.value = response.configs
      total.value = response.total
    } finally {
      isLoading.value = false
    }
  }

  async function createConfig(data: LlmConfigCreate) {
    const config = await llmApi.create(data)
    await fetchConfigs()
    return config
  }

  async function updateConfig(id: string, data: LlmConfigUpdate) {
    const config = await llmApi.update(id, data)
    await fetchConfigs()
    return config
  }

  async function deleteConfig(id: string) {
    await llmApi.delete(id)
    await fetchConfigs()
  }

  async function activateConfig(id: string) {
    const config = await llmApi.activate(id)
    await fetchConfigs()
    return config
  }

  async function testConnection(data: LlmTestRequest): Promise<LlmTestResult> {
    return await llmApi.test(data)
  }

  async function testConfigById(id: string): Promise<LlmTestResult> {
    return await llmApi.testConfig(id)
  }

  return {
    configs,
    isLoading,
    total,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    testConnection,
    testConfigById
  }
})
