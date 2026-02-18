<template>
  <div v-if="isWriteTodos && toolCall.todos" class="tool-call-card">
    <TodoListCard :todos="toolCall.todos" />
  </div>
  <div v-else class="tool-call-card" :class="statusClass">
    <div class="tool-header">
      <div class="tool-info">
        <v-icon :color="statusColor" size="16" class="status-icon">
          {{ statusIcon }}
        </v-icon>
        <span class="tool-name">{{ toolCall.name }}</span>
        <span class="tool-status" :class="statusClass">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolCall } from '@/types/chat'
import TodoListCard from './TodoListCard.vue'

const props = defineProps<{
  toolCall: ToolCall
}>()

const isWriteTodos = computed(() => props.toolCall.name === 'write_todos')

const statusClass = computed(() => props.toolCall.status)

const statusColor = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return 'warning'
    case 'completed': return 'success'
    default: return 'grey'
  }
})

const statusIcon = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return 'mdi-loading mdi-spin'
    case 'completed': return 'mdi-check-circle'
    default: return 'mdi-circle-outline'
  }
})

const statusText = computed(() => {
  switch (props.toolCall.status) {
    case 'running': return '执行中'
    case 'completed': return '完成'
    default: return '等待'
  }
})
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

.v-theme--dark .tool-call-card {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .tool-name {
  color: rgba(255, 255, 255, 0.8);
}

.v-theme--dark .tool-status {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}
</style>
