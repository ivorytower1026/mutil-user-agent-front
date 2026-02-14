<template>
  <div ref="listRef" class="message-list">
    <div v-if="messages.length === 0" class="empty-state">
      <v-icon size="64" color="grey-lighten-1">mdi-chat-outline</v-icon>
      <p class="text-medium-emphasis mt-4">开始一个新对话</p>
    </div>
    
    <MessageItem
      v-for="(message, index) in messages"
      :key="message.id"
      :message="message"
      :is-streaming="isStreaming && index === messages.length - 1"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types/chat'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: Message[]
  isStreaming?: boolean
}>()

const listRef = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}

watch(
  () => props.messages.length,
  () => scrollToBottom()
)

watch(
  () => props.messages[props.messages.length - 1]?.content,
  () => scrollToBottom()
)
</script>

<style scoped>
.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
}
</style>
