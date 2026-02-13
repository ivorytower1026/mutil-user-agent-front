import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session } from '@/types/chat'
import { chatApi } from '@/api'

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([])
  const currentThreadId = ref<string | null>(null)
  const isLoading = ref(false)

  async function createSession() {
    isLoading.value = true
    try {
      const response = await chatApi.createSession()
      const newSession: Session = {
        threadId: response.thread_id,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
        status: 'idle'
      }
      sessions.value.unshift(newSession)
      currentThreadId.value = response.thread_id
      return response.thread_id
    } finally {
      isLoading.value = false
    }
  }

  function setCurrentThread(threadId: string) {
    currentThreadId.value = threadId
  }

  function updateSessionStatus(threadId: string, status: 'idle' | 'interrupted') {
    const session = sessions.value.find(s => s.threadId === threadId)
    if (session) {
      session.status = status
      session.updatedAt = new Date()
    }
  }

  function incrementMessageCount(threadId: string) {
    const session = sessions.value.find(s => s.threadId === threadId)
    if (session) {
      session.messageCount++
      session.updatedAt = new Date()
    }
  }

  return {
    sessions,
    currentThreadId,
    isLoading,
    createSession,
    setCurrentThread,
    updateSessionStatus,
    incrementMessageCount
  }
})
