import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFileStore } from '@/stores/file'
import { initWebDAVClient, resetWebDAVClient } from '@/api/webdav'

export function useWebDAV() {
  const authStore = useAuthStore()
  const fileStore = useFileStore()

  function initClient() {
    const token = authStore.token
    if (token) {
      initWebDAVClient(token)
      fileStore.loadDirectory('/')
    }
  }

  function resetClient() {
    resetWebDAVClient()
  }

  onMounted(() => {
    initClient()
  })

  onUnmounted(() => {
    resetClient()
  })

  return {
    initClient,
    resetClient
  }
}
