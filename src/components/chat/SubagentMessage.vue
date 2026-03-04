<template>
  <div class="subagent-message">
    <div class="subagent-header" @click="handleToggle">
      <div class="header-left">
        <v-icon size="16" color="primary">mdi-robot-outline</v-icon>
        <span class="subagent-title">{{ subagentName || 'Subagent' }}</span>
      </div>
      <div class="header-right">
        <span v-if="content && collapsed" class="preview">{{ contentPreview }}</span>
        <v-icon size="20" color="grey">
          {{ collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
        </v-icon>
      </div>
    </div>
    
    <div v-show="!collapsed" class="subagent-content">
      <MarkdownRenderer v-if="content" :content="content" />
      <div v-else-if="isStreaming" class="loading-container">
        <LoadingDots />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import LoadingDots from './LoadingDots.vue'

const props = withDefaults(defineProps<{
  subagentName?: string
  content: string
  collapsed?: boolean
  isStreaming?: boolean
}>(), {
  collapsed: true,
  isStreaming: false
})

const emit = defineEmits<{
  toggle: []
}>()

const contentPreview = computed(() => {
  if (!props.content) return ''
  const firstLine = props.content.split('\n')[0]
  return firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine
})

function handleToggle() {
  emit('toggle')
}
</script>

<style scoped>
.subagent-message {
  margin: 8px 0;
  margin-left: 16px;
  border-left: 3px solid rgb(var(--v-theme-primary));
  border-radius: 0 8px 8px 0;
  overflow: hidden;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.subagent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  background: rgba(var(--v-theme-primary), 0.06);
  transition: background 0.2s;
  user-select: none;
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
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-theme--dark .preview {
  color: rgba(255, 255, 255, 0.5);
}

.subagent-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.loading-container {
  padding: 8px 0;
}
</style>
