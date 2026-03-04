<template>
  <div class="subagent-message" :class="{ collapsed, streaming: isStreaming }">
    <div class="subagent-header" @click="handleToggle">
      <div class="header-left">
        <div class="title-wrapper">
          <span class="subagent-badge">智能体研究</span>
          <!-- <span class="subagent-label">{{ displayName }}</span> -->
        </div>
      </div>
      <div class="header-right">
        <span v-if="content && collapsed" class="preview">{{ contentPreview }}</span>
        <v-icon size="20" class="toggle-icon">
          {{ collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
        </v-icon>
      </div>
    </div>
    
    <div v-show="!collapsed" class="subagent-content">
      <div class="content-glow"></div>
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

const displayName = computed(() => {
  if (!props.subagentName) return '智能代理'
  const friendlyNames: Record<string, string> = {
    'explore': '代码探索',
    'code-reviewer': '代码审查',
    'general': '通用助手',
  }
  return friendlyNames[props.subagentName] || props.subagentName
})

function handleToggle() {
  emit('toggle')
}
</script>

<style scoped>
.subagent-message {
  margin: 12px 0;
  margin-left: 16px;
  border-left: 3px solid;
  border-image: linear-gradient(180deg, #00bcd4, #7c4dff) 1;
  border-radius: 0 12px 12px 0;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(124, 77, 255, 0.05) 100%);
  box-shadow: 0 2px 12px rgba(0, 188, 212, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subagent-message:hover {
  box-shadow: 0 4px 20px rgba(0, 188, 212, 0.2);
  transform: translateX(2px);
}

.subagent-message.collapsed {
  opacity: 0.85;
}

.subagent-message.collapsed:hover {
  opacity: 1;
}

.subagent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.08) 0%, rgba(124, 77, 255, 0.08) 100%);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
}

.subagent-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #00bcd4, #7c4dff);
  opacity: 0;
  transition: opacity 0.3s;
}

.subagent-header:hover::before {
  opacity: 1;
}

.subagent-header:hover {
  background: linear-gradient(90deg, rgba(0, 188, 212, 0.12) 0%, rgba(124, 77, 255, 0.12) 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.subagent-badge {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #00bcd4;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subagent-message.streaming .subagent-badge {
  background: linear-gradient(90deg, #00bcd4, #7c4dff, #00bcd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.subagent-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.v-theme--dark .subagent-label {
  color: rgba(255, 255, 255, 0.9);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  color: #00bcd4;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.subagent-message:not(.collapsed) .toggle-icon {
  transform: rotate(0deg);
}

.preview {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.v-theme--dark .preview {
  color: rgba(255, 255, 255, 0.5);
}

.subagent-content {
  position: relative;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(0, 188, 212, 0.15);
}

.content-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.5), transparent);
  opacity: 0;
}

.subagent-message.streaming .content-glow {
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

.loading-container {
  padding: 12px 0;
}
</style>
