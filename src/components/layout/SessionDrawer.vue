<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :width="280"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-list density="compact" nav>
      <v-list-item
        color="primary"
        prepend-icon="mdi-plus"
        title="新对话"
        @click="handleCreateSession"
      />
    </v-list>
    
    <v-divider class="my-2" />
    
    <v-list-subheader>会话列表</v-list-subheader>
    
    <v-list v-if="sessions.length > 0" density="compact" nav>
      <v-list-item
        v-for="session in sessions"
        :key="session.threadId"
        :active="session.threadId === currentThreadId"
        color="primary"
        @click="handleSelectSession(session.threadId)"
      >
        <template #prepend>
          <v-icon :color="session.status === 'interrupted' ? 'warning' : 'default'">
            {{ session.status === 'interrupted' ? 'mdi-pause-circle' : 'mdi-chat-outline' }}
          </v-icon>
        </template>
        
        <v-list-item-title class="text-truncate">
          {{ session.title || `对话 ${session.threadId.slice(0, 8)}...` }}
        </v-list-item-title>
        
        <v-list-item-subtitle>
          {{ session.messageCount }} 条消息
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
    
    <div v-else class="pa-4 text-center text-medium-emphasis">
      <v-icon size="48" color="grey-lighten-1">mdi-chat-plus-outline</v-icon>
      <p class="mt-2">暂无会话</p>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'session-created': [threadId: string]
}>()

const sessionStore = useSessionStore()
const chatStore = useChatStore()

const sessions = computed(() => sessionStore.sessions)
const currentThreadId = computed(() => sessionStore.currentThreadId)

async function handleCreateSession() {
  const threadId = await sessionStore.createSession()
  chatStore.clearMessages()
  emit('session-created', threadId)
}

function handleSelectSession(threadId: string) {
  sessionStore.setCurrentThread(threadId)
  chatStore.loadHistory(threadId)
}
</script>
