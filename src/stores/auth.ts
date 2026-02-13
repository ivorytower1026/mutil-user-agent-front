import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthState {
  token: string | null
  userId: string | null
  username: string | null
}

const STORAGE_KEY = 'auth'

export const useAuthStore = defineStore('auth', () => {
  function loadStoredAuth(): AuthState {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return { token: null, userId: null, username: null }
  }

  const stored = loadStoredAuth()
  
  const token = ref<string | null>(stored.token)
  const userId = ref<string | null>(stored.userId)
  const username = ref<string | null>(stored.username)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(data: { token: string; userId: string; username: string }) {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.token,
      userId: data.userId,
      username: data.username
    }))
  }

  function logout() {
    token.value = null
    userId.value = null
    username.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return {
    token,
    userId,
    username,
    isAuthenticated,
    setAuth,
    logout
  }
})
