<template>
  <div class="chat-container">
    <MessageList
      :messages="messages"
      :is-streaming="isLoading"
      :has-thread="!!currentThreadId || isPendingNewSession"
    />
    
    <ChatInput
      :is-loading="isLoading"
      :interrupt="interrupt"
      :disabled="isLoading"
      :pending-files="pendingFiles"
      @send="handleSend"
      @resume="handleResume"
      @add-files="addFiles"
      @remove-file="removeFile"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { useChatStream } from '@/composables/useChatStream'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const { sendMessage, resumeInterrupt, pendingFiles, addFiles, removeFile } = useChatStream()

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const interrupt = computed(() => chatStore.interrupt)
const currentThreadId = computed(() => sessionStore.currentThreadId)
const isPendingNewSession = computed(() => sessionStore.isPendingNewSession)

async function handleSend(message: string) {
  let threadId = sessionStore.currentThreadId
  
  if (!threadId) {
    threadId = await sessionStore.createSession()
  }
  
  if (threadId) {
    sendMessage(threadId, message)
  }
}

function handleResume(optionId: string) {
  if (sessionStore.currentThreadId) {
    resumeInterrupt(sessionStore.currentThreadId, optionId)
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
}

.v-theme--dark .chat-container {
  background-color: #212121;
}
</style>
