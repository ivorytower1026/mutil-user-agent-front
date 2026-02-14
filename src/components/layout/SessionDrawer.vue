<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :width="280"
    fixed
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <v-list density="compact" nav>
          <v-list-item
            color="primary"
            prepend-icon="mdi-plus"
            title="新对话"
            @click="handleCreateSession"
          />
        </v-list>
        <v-divider />
        <v-list-subheader>会话列表</v-list-subheader>
      </div>
      
      <div ref="scrollContainer" class="drawer-scroll" @scroll="handleScroll">
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
        
        <div v-if="isLoadingMore" class="pa-4 text-center">
          <v-progress-circular indeterminate size="24" />
        </div>
        
        <div v-if="!hasMore && sessions.length > 0" class="pa-2 text-center text-caption text-medium-emphasis">
          没有更多了
        </div>
        
        <div v-if="sessions.length === 0 && !isLoading" class="pa-4 text-center text-medium-emphasis">
          <v-icon size="48" color="grey-lighten-1">mdi-chat-plus-outline</v-icon>
          <p class="mt-2">暂无会话</p>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const scrollContainer = ref<HTMLElement | null>(null)

const sessions = computed(() => sessionStore.sessions)
const currentThreadId = computed(() => sessionStore.currentThreadId)
const isLoadingMore = computed(() => sessionStore.isLoadingMore)
const hasMore = computed(() => sessionStore.hasMore)
const isLoading = computed(() => sessionStore.isLoading)

onMounted(() => {
  sessionStore.fetchSessions()
})

async function handleCreateSession() {
  const threadId = await sessionStore.createSession()
  chatStore.clearMessages()
  emit('session-created', threadId)
}

function handleSelectSession(threadId: string) {
  sessionStore.setCurrentThread(threadId)
  chatStore.loadHistory(threadId)
}

function handleScroll() {
  if (!scrollContainer.value || isLoadingMore.value || !hasMore.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    sessionStore.loadMoreSessions()
  }
}
</script>

<style scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.drawer-header {
  flex-shrink: 0;
}

.drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
