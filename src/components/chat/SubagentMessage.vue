<template>
  <div class="subagent-message">
    <div class="subagent-header" @click="toggleCollapse">
      <div class="header-left">
        <v-icon size="18" color="primary">mdi-robot-outline</v-icon>
        <span class="subagent-title">{{ displayName }}</span>
        <span v-if="subagentId" class="subagent-id">#{{ subagentId.slice(0, 8) }}</span>
        <span v-if="events.length > 0" class="event-count">({{ events.length }} 个事件)</span>
      </div>
      <v-icon size="16" color="grey">
        {{ collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
      </v-icon>
    </div>
    
    <div v-if="!collapsed" class="subagent-content">
      <div
        v-for="(event, index) in events"
        :key="index"
        class="subagent-event"
        :class="event.type"
      >
        <div v-if="event.type === 'content'" class="event-content">
          {{ event.content }}
        </div>
        
        <div v-else-if="event.type === 'tool_start'" class="event-tool tool-start">
          <v-icon size="14" color="warning">mdi-timer-sand</v-icon>
          <span>正在执行: {{ event.tool }}</span>
        </div>
        
        <div v-else-if="event.type === 'tool_end'" class="event-tool tool-end">
          <v-icon size="14" color="success">mdi-check-circle</v-icon>
          <span>完成: {{ event.tool }}</span>
        </div>
        
        <div v-else-if="event.type === 'interrupt'" class="event-interrupt">
          <v-icon size="14" color="error">mdi-pause-circle</v-icon>
          <span>{{ event.info }}</span>
        </div>
      </div>
      
      <div v-if="events.length === 0 && isStreaming" class="event-loading">
        <v-progress-circular indeterminate size="16" color="primary" />
        <span>处理中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SubagentEvent } from '@/types/chat'

const props = withDefaults(defineProps<{
  subagentId?: string
  subagentName?: string
  events: SubagentEvent[]
  collapsed?: boolean
  isStreaming?: boolean
}>(), {
  collapsed: true,
  isStreaming: false
})

const emit = defineEmits<{
  toggle: []
}>()

const displayName = computed(() => {
  return props.subagentName || 'Subagent'
})

function toggleCollapse() {
  emit('toggle')
}
</script>

<style scoped>
.subagent-message {
  margin: 12px 0;
  margin-left: 24px;
  border-left: 3px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.subagent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  background: rgba(var(--v-theme-primary), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.12);
  transition: background 0.2s;
}

.subagent-header:hover {
  background: rgba(var(--v-theme-primary), 0.12);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subagent-title {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
}

.subagent-id {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.v-theme--dark .subagent-id {
  color: rgba(255, 255, 255, 0.5);
}

.event-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

.v-theme--dark .event-count {
  color: rgba(255, 255, 255, 0.4);
}

.subagent-content {
  padding: 12px 16px;
  background: rgb(var(--v-theme-surface));
}

.subagent-event {
  padding: 6px 0;
  font-size: 13px;
  line-height: 1.5;
}

.event-content {
  color: rgba(0, 0, 0, 0.7);
}

.v-theme--dark .event-content {
  color: rgba(255, 255, 255, 0.7);
}

.event-tool {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  margin: 4px 0;
}

.tool-start {
  background: rgba(255, 193, 7, 0.15);
  color: #92400e;
}

.v-theme--dark .tool-start {
  background: rgba(255, 193, 7, 0.2);
  color: #fcd34d;
}

.tool-end {
  background: rgba(76, 175, 80, 0.15);
  color: #065f46;
}

.v-theme--dark .tool-end {
  background: rgba(76, 175, 80, 0.2);
  color: #6ee7b7;
}

.event-interrupt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid rgb(var(--v-theme-error));
  border-radius: 4px;
  color: rgb(var(--v-theme-error));
}

.event-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: rgba(0, 0, 0, 0.5);
  font-size: 13px;
}

.v-theme--dark .event-loading {
  color: rgba(255, 255, 255, 0.5);
}
</style>
