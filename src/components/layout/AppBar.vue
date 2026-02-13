<template>
  <v-app-bar color="surface" elevation="1">
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')" />
    
    <AppLogo />
    
    <v-spacer />
    
    <ThemeToggle />
    
    <v-menu>
      <template #activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-avatar color="primary" size="32">
            <span class="text-white text-caption">{{ userInitial }}</span>
          </v-avatar>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item prepend-icon="mdi-account">
          <v-list-item-title>{{ username }}</v-list-item-title>
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
import AppLogo from '@/components/common/AppLogo.vue'
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
