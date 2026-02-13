<template>
  <div :class="['message-item', message.role]">
    <div class="message-avatar">
      <v-avatar :color="avatarColor" size="36">
        <v-icon color="white" size="small">{{ avatarIcon }}</v-icon>
      </v-avatar>
    </div>
    
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ roleText }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
      </div>
      
      <div class="message-body">
        <MarkdownRenderer 
          v-if="message.content" 
          :content="message.content" 
        />
        <LoadingDots v-if="isStreaming && !message.content" />
        
        <div v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
          <ToolCallCard
            v-for="toolCall in message.toolCalls"
            :key="toolCall.id"
            :tool-call="toolCall"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'
import LoadingDots from './LoadingDots.vue'
import ToolCallCard from './ToolCallCard.vue'

const props = withDefaults(defineProps<{
  message: Message
  isStreaming?: boolean
}>(), {
  isStreaming: false
})

const avatarColor = computed(() => {
  switch (props.message.role) {
    case 'user': return 'primary'
    case 'assistant': return 'secondary'
    case 'tool': return 'info'
    case 'system': return 'grey'
    default: return 'grey'
  }
})

const avatarIcon = computed(() => {
  switch (props.message.role) {
    case 'user': return 'mdi-account'
    case 'assistant': return 'mdi-robot'
    case 'tool': return 'mdi-tools'
    case 'system': return 'mdi-cog'
    default: return 'mdi-help'
  }
})

const roleText = computed(() => {
  switch (props.message.role) {
    case 'user': return '你'
    case 'assistant': return 'AI助手'
    case 'tool': return '工具'
    case 'system': return '系统'
    default: return '未知'
  }
})

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
}

.message-item.user {
  background-color: rgba(25, 118, 210, 0.05);
}

.message-item.assistant {
  background-color: transparent;
}

.message-item.tool {
  background-color: rgba(33, 150, 243, 0.05);
}

.message-item.system {
  background-color: rgba(158, 158, 158, 0.1);
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-role {
  font-weight: 600;
  font-size: 0.9em;
}

.message-time {
  font-size: 0.75em;
  color: rgba(0, 0, 0, 0.5);
}

.message-body {
  font-size: 0.95em;
}

.tool-calls {
  margin-top: 8px;
}

.v-theme--dark .message-item.user {
  background-color: rgba(25, 118, 210, 0.1);
}

.v-theme--dark .message-item.tool {
  background-color: rgba(33, 150, 243, 0.1);
}

.v-theme--dark .message-item.system {
  background-color: rgba(158, 158, 158, 0.15);
}

.v-theme--dark .message-time {
  color: rgba(255, 255, 255, 0.5);
}
</style>
