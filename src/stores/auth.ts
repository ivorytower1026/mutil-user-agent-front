import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthState {
  token: string | null
  userId: string | null
  username: string | null
  isAdmin: boolean
}

const STORAGE_KEY = 'auth'

export const useAuthStore = defineStore('auth', () => {
  function loadStoredAuth(): AuthState {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          token: parsed.token || null,
          userId: parsed.userId || null,
          username: parsed.username || null,
          isAdmin: parsed.isAdmin ?? false
        }
      }
    } catch {
      // ignore
    }
    return { token: null, userId: null, username: null, isAdmin: false }
  }

  const stored = loadStoredAuth()

  const token = ref<string | null>(stored.token)
  const userId = ref<string | null>(stored.userId)
  const username = ref<string | null>(stored.username)
  const isAdmin = ref<boolean>(stored.isAdmin)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(data: { token: string; userId: string; username: string; isAdmin?: boolean }) {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    isAdmin.value = data.isAdmin ?? false

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.token,
      userId: data.userId,
      username: data.username,
      isAdmin: data.isAdmin ?? false
    }))
  }

  function logout() {
    token.value = null
    userId.value = null
    username.value = null
    isAdmin.value = false
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return {
    token,
    userId,
    username,
    isAdmin,
    isAuthenticated,
    setAuth,
    logout
  }
})
