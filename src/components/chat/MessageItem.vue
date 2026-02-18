<template>
  <div class="message-item" :class="message.role">
    <div class="message-content">
      <div class="message-body">
        <div class="message-text">
          <MarkdownRenderer 
            v-if="message.content" 
            :content="message.content" 
          />
          <LoadingDots v-if="isStreaming && !message.content" />
        </div>
        
        <TodoListCard
          v-if="message.todos && message.todos.length > 0"
          :todos="message.todos"
        />
        
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
import type { Message } from '@/types/chat'
import MarkdownRenderer from './MarkdownRenderer.vue'
import LoadingDots from './LoadingDots.vue'
import ToolCallCard from './ToolCallCard.vue'
import TodoListCard from './TodoListCard.vue'

withDefaults(defineProps<{
  message: Message
  isStreaming?: boolean
}>(), {
  isStreaming: false
})
</script>

<style scoped>
.message-item {
  padding: 12px 0;
}

.message-content {
  display: flex;
  gap: 16px;
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}

.message-body {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
}

.message-text {
  font-size: 15px;
}

.message-item.user .message-content {
  flex-direction: row-reverse;
}

.message-item.user .message-body {
  display: flex;
  justify-content: flex-end;
}

.message-item.user .message-text {
  background-color: #eeecec;
  padding: 10px 16px;
  border-radius: 18px;
  max-width: 85%;
}

.tool-calls {
  margin-top: 12px;
}

.v-theme--dark .message-item.user .message-text {
  background-color: #4f4e4e;
}
</style>
