import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api'
import type { LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const username = computed(() => authStore.username)
  const userId = computed(() => authStore.userId)

  async function login(credentials: LoginRequest) {
    const response = await authApi.login(credentials)
    authStore.setAuth({
      token: response.access_token,
      userId: credentials.username,
      username: credentials.username
    })
    return response
  }

  async function register(data: RegisterRequest) {
    const response = await authApi.register(data)
    return response
  }

  function logout() {
    authStore.logout()
    router.push('/login')
  }

  return {
    isAuthenticated,
    username,
    userId,
    login,
    register,
    logout
  }
}
