<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>测试 MCP 连接</v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-2">正在测试连接...</div>
        </div>
        <div v-else-if="result">
          <v-alert v-if="result.success" type="success" class="mb-4">
            连接成功！发现 {{ result.tools_count }} 个工具
          </v-alert>
          <v-alert v-else type="error" class="mb-4">
            连接失败: {{ result.error }}
          </v-alert>
          <div v-if="result.tools && result.tools.length > 0">
            <div class="text-subtitle-2 mb-2">可用工具:</div>
            <v-list density="compact" max-height="300" class="overflow-y-auto">
              <v-list-item v-for="tool in result.tools" :key="tool.name">
                <v-list-item-title class="font-weight-medium">{{ tool.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ tool.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMcpStore } from '@/stores/mcp'
import type { McpTestResult } from '@/types/mcp'

const props = defineProps<{
  modelValue: boolean
  serverName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useMcpStore()
const loading = ref(false)
const result = ref<McpTestResult | null>(null)

watch(() => props.modelValue, async (val) => {
  if (val && props.serverName) {
    result.value = null
    loading.value = true
    try {
      result.value = await store.testConnection(props.serverName)
    } catch (e) {
      result.value = {
        success: false,
        error: e instanceof Error ? e.message : '测试失败'
      }
    } finally {
      loading.value = false
    }
  }
})
</script>
