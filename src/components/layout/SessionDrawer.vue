<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :width="260"
    fixed
    class="session-drawer"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="drawer-content">
      <div class="drawer-header">
        <button class="new-chat-btn" @click="handleCreateSession">
          <v-icon size="18">mdi-plus</v-icon>
          <span>新对话</span>
        </button>
      </div>
      
      <div ref="scrollContainer" class="drawer-scroll" @scroll="handleScroll">
        <div class="session-list">
          <div
            v-for="session in sessions"
            :key="session.threadId"
            class="session-item"
            :class="{ active: session.threadId === currentThreadId }"
            @click="handleSelectSession(session.threadId)"
          >
            <v-icon 
              size="18" 
              :color="session.status === 'interrupted' ? 'warning' : 'default'"
              class="session-icon"
            >
              {{ session.status === 'interrupted' ? 'mdi-pause-circle' : 'mdi-chat-outline' }}
            </v-icon>
            <div class="session-info">
              <div class="session-title">
                {{ session.title || '新对话' }}
              </div>
              <div class="session-meta">
                {{ session.messageCount }} 条消息
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="isLoadingMore" class="loading-more">
          <v-progress-circular indeterminate size="20" width="2" />
        </div>
        
        <div v-if="!hasMore && sessions.length > 0" class="no-more">
          没有更多了
        </div>
        
        <div v-if="sessions.length === 0 && !isLoading" class="empty-state">
          <v-icon size="40" color="grey-lighten-1">mdi-chat-outline</v-icon>
          <p>暂无会话</p>
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
  padding: 12px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  transition: background-color 0.15s;
}

.new-chat-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.drawer-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.session-list {
  padding: 4px 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.session-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.session-item.active {
  background-color: rgba(0, 0, 0, 0.06);
}

.session-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 2px;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.no-more {
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.3);
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: rgba(0, 0, 0, 0.4);
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.v-theme--dark .session-drawer {
  background-color: #171717 !important;
}

.v-theme--dark .new-chat-btn {
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.v-theme--dark .new-chat-btn:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.v-theme--dark .session-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.v-theme--dark .session-item.active {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .session-title {
  color: rgba(255, 255, 255, 0.8);
}

.v-theme--dark .session-meta {
  color: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .no-more {
  color: rgba(255, 255, 255, 0.3);
}

.v-theme--dark .empty-state {
  color: rgba(255, 255, 255, 0.4);
}
</style>
