<template>
  <v-layout class="rounded rounded-md">
    <SessionDrawer
      v-model="drawerOpen"
      @session-created="handleSessionCreated"
    />
    
    <AppBar @toggle-drawer="drawerOpen = !drawerOpen" />
    
    <v-main>
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
