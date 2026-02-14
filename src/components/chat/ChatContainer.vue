<template>
  <div class="chat-container">
    <MessageList
      :messages="messages"
      :is-streaming="isLoading"
      :has-thread="!!currentThreadId || isPendingNewSession"
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
const currentThreadId = computed(() => sessionStore.currentThreadId)
const isPendingNewSession = computed(() => sessionStore.isPendingNewSession)

const showInterruptDialog = computed({
  get: () => !!chatStore.interrupt,
  set: () => chatStore.clearInterrupt()
})

async function handleSend(message: string) {
  let threadId = sessionStore.currentThreadId
  
  if (!threadId) {
    threadId = await sessionStore.createSession()
  }
  
  if (threadId) {
    sendMessage(threadId, message)
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
