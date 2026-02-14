<template>
  <v-app-bar flat class="app-bar">
    <v-app-bar-nav-icon 
      variant="text" 
      @click="$emit('toggle-drawer')" 
    />
    
    <span class="app-title">AI Assistant</span>
    
    <v-spacer />
    
    <ThemeToggle />
    
    <v-menu>
      <template #activator="{ props }">
        <v-btn
          variant="text"
          v-bind="props"
          class="user-btn"
        >
          <v-avatar color="#10a37f" size="28">
            <span class="text-white text-caption">{{ userInitial }}</span>
          </v-avatar>
        </v-btn>
      </template>
      
      <v-list density="compact">
        <v-list-item>
          <v-list-item-title class="text-medium-emphasis">{{ username }}</v-list-item-title>
        </v-list-item>
        
        <v-divider />
        
        <v-list-item
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          <v-list-item-title>退出登录</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

defineEmits<{
  'toggle-drawer': []
}>()

const { username, logout } = useAuth()

const userInitial = computed(() => {
  return username.value ? username.value.charAt(0).toUpperCase() : 'U'
})

function handleLogout() {
  logout()
}
</script>

<style scoped>
.app-bar {
  background-color: #fff !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.user-btn {
  margin-left: 8px;
}

.v-theme--dark .app-bar {
  background-color: #212121 !important;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .app-title {
  color: rgba(255, 255, 255, 0.87);
}
</style>
