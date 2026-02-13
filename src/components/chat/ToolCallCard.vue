<template>
  <v-expansion-panels v-model="panel" class="tool-call-card">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <div class="d-flex align-center gap-2">
          <v-icon :color="statusColor" size="small">
            {{ statusIcon }}
          </v-icon>
          <span class="font-weight-medium">{{ toolCall.name }}</span>
          <v-chip size="x-small" :color="statusColor" variant="flat">
            {{ statusText }}
          </v-chip>
        </div>
      </v-expansion-panel-title>
      
      <v-expansion-panel-text>
        <div v-if="hasArgs" class="mb-3">
          <div class="text-caption text-medium-emphasis mb-1">参数</div>
          <pre class="code-block">{{ formatJson(toolCall.args) }}</pre>
        </div>
        
        <div v-if="toolCall.output !== undefined">
          <div class="text-caption text-medium-emphasis mb-1">输出</div>
          <pre class="code-block">{{ formatJson(toolCall.output) }}</pre>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToolCall } from '@/types/chat'

const props = withDefaults(defineProps<{
  toolCall: ToolCall
  defaultExpanded?: boolean
}>(), {
  defaultExpanded: true
})

const panel = ref(props.defaultExpanded ? 0 : undefined)

const statusColor = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return 'warning'
    case 'completed': return 'success'
    case 'error': return 'error'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return 'mdi-loading mdi-spin'
    case 'completed': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    default: return 'mdi-clock-outline'
  }
})

const statusText = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return '执行中'
    case 'completed': return '完成'
    case 'error': return '错误'
    default: return '等待'
  }
})

const hasArgs = computed(() => {
  return props.toolCall.args && Object.keys(props.toolCall.args).length > 0
})

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.tool-call-card {
  margin: 8px 0;
}

.code-block {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px 12px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85em;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.v-theme--dark .code-block {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
