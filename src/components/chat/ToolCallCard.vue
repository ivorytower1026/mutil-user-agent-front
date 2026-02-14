<template>
  <div class="tool-call-card" :class="statusClass">
    <div class="tool-header" @click="expanded = !expanded">
      <div class="tool-info">
        <v-icon :color="statusColor" size="16" class="status-icon">
          {{ statusIcon }}
        </v-icon>
        <span class="tool-name">{{ toolCall.name }}</span>
        <span class="tool-status" :class="statusClass">{{ statusText }}</span>
      </div>
      <v-icon size="16" class="expand-icon" :class="{ expanded }">
        mdi-chevron-down
      </v-icon>
    </div>
    
    <div v-if="expanded" class="tool-content">
      <div v-if="hasArgs" class="tool-section">
        <div class="section-label">参数</div>
        <pre class="code-block">{{ formatJson(toolCall.args) }}</pre>
      </div>
      
      <div v-if="toolCall.output !== undefined" class="tool-section">
        <div class="section-label">输出</div>
        <pre class="code-block">{{ formatJson(toolCall.output) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToolCall } from '@/types/chat'

const props = defineProps<{
  toolCall: ToolCall
}>()

const expanded = ref(false)

const statusClass = computed(() => props.toolCall.status)

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
    default: return 'mdi-circle-outline'
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
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 8px;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.tool-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  flex-shrink: 0;
}

.tool-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.tool-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.5);
}

.tool-status.running {
  background-color: rgba(255, 152, 0, 0.1);
  color: #f57c00;
}

.tool-status.completed {
  background-color: rgba(76, 175, 80, 0.1);
  color: #388e3c;
}

.tool-status.error {
  background-color: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
}

.expand-icon {
  transition: transform 0.2s;
  color: rgba(0, 0, 0, 0.4);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.tool-content {
  padding: 0 12px 12px;
}

.tool-section {
  margin-top: 8px;
}

.section-label {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-block {
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
  padding: 8px 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.v-theme--dark .tool-call-card {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .tool-header:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.v-theme--dark .tool-name {
  color: rgba(255, 255, 255, 0.8);
}

.v-theme--dark .tool-status {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.v-theme--dark .expand-icon {
  color: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .section-label {
  color: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .code-block {
  background-color: rgba(255, 255, 255, 0.06);
}
</style>
