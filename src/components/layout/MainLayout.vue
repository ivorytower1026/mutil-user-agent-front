<template>
  <v-layout class="rounded rounded-md main-layout">
    <SessionDrawer
      v-model="drawerOpen"
      @session-created="handleSessionCreated"
    />
    
    <AppBar @toggle-drawer="drawerOpen = !drawerOpen" />
    
    <v-main class="main-content">
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import SessionDrawer from './SessionDrawer.vue'
import AppBar from './AppBar.vue'

const emit = defineEmits<{
  'session-created': [threadId: string]
}>()

const sessionStore = useSessionStore()

const drawerOpen = ref(true)

onMounted(async () => {
  if (!sessionStore.currentThreadId) {
    const threadId = await sessionStore.createSession()
    emit('session-created', threadId)
  }
})

function handleSessionCreated(threadId: string) {
  emit('session-created', threadId)
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  max-height: 100vh;
}

.main-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
