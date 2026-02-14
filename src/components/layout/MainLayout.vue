<template>
  <v-layout class="rounded rounded-md main-layout">
    <SessionDrawer v-model="drawerOpen" />
    
    <AppBar @toggle-drawer="drawerOpen = !drawerOpen" />
    
    <v-main class="main-content">
      <slot />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SessionDrawer from './SessionDrawer.vue'
import AppBar from './AppBar.vue'

const drawerOpen = ref(true)
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
