import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session } from '@/types/chat'
import { chatApi } from '@/api'

const PAGE_SIZE = 20

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([])
  const currentThreadId = ref<string | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const currentPage = ref(1)
  const total = ref(0)
  const hasMore = ref(true)
  const isPendingNewSession = ref(false)

  async function fetchSessions() {
    isLoading.value = true
    currentPage.value = 1
    try {
      const response = await chatApi.getSessions(currentPage.value, PAGE_SIZE)
      sessions.value = response.threads.map(t => ({
        threadId: t.thread_id,
        title: t.title ?? undefined,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.created_at),
        messageCount: t.message_count,
        status: t.status
      }))
      total.value = response.total
      hasMore.value = sessions.value.length < response.total
    } finally {
      isLoading.value = false
    }
  }

  async function loadMoreSessions() {
    if (isLoadingMore.value || !hasMore.value) return
    
    isLoadingMore.value = true
    currentPage.value++
    try {
      const response = await chatApi.getSessions(currentPage.value, PAGE_SIZE)
      const newSessions = response.threads.map(t => ({
        threadId: t.thread_id,
        title: t.title ?? undefined,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.created_at),
        messageCount: t.message_count,
        status: t.status
      }))
      sessions.value.push(...newSessions)
      hasMore.value = sessions.value.length < response.total
    } finally {
      isLoadingMore.value = false
    }
  }

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
      isPendingNewSession.value = false
      return response.thread_id
    } finally {
      isLoading.value = false
    }
  }

  function startNewSession() {
    currentThreadId.value = null
    isPendingNewSession.value = true
  }

  function setCurrentThread(threadId: string) {
    currentThreadId.value = threadId
    isPendingNewSession.value = false
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

  function updateThreadTitle(threadId: string, title: string) {
    const session = sessions.value.find(s => s.threadId === threadId)
    if (session) {
      session.title = title
      session.updatedAt = new Date()
    }
  }

  return {
    sessions,
    currentThreadId,
    isLoading,
    isLoadingMore,
    hasMore,
    isPendingNewSession,
    fetchSessions,
    loadMoreSessions,
    createSession,
    startNewSession,
    setCurrentThread,
    updateSessionStatus,
    incrementMessageCount,
    updateThreadTitle
  }
})
