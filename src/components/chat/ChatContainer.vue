<template>
  <div class="chat-container d-flex flex-column fill-height">
    <MessageList
      :messages="messages"
      :is-streaming="isLoading"
    />
    
    <InterruptDialog
      v-model="showInterruptDialog"
      :interrupt="interrupt"
      :loading="isLoading"
      @continue="handleResumeContinue"
      @cancel="handleResumeCancel"
    />
    
    <ChatInput
      :disabled="isLoading || !!interrupt"
      @send="handleSend"
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
import InterruptDialog from '@/components/interrupt/InterruptDialog.vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const { sendMessage, resumeInterrupt } = useChatStream()

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const interrupt = computed(() => chatStore.interrupt)

const showInterruptDialog = computed({
  get: () => !!chatStore.interrupt,
  set: () => chatStore.clearInterrupt()
})

function handleSend(message: string) {
  if (sessionStore.currentThreadId) {
    sendMessage(sessionStore.currentThreadId, message)
  }
}

function handleResumeContinue() {
  if (sessionStore.currentThreadId) {
    resumeInterrupt(sessionStore.currentThreadId, 'continue')
  }
}

function handleResumeCancel() {
  if (sessionStore.currentThreadId) {
    resumeInterrupt(sessionStore.currentThreadId, 'cancel')
  }
}
</script>

<style scoped>
.chat-container {
  background-color: rgb(var(--v-theme-background));
}
</style>
