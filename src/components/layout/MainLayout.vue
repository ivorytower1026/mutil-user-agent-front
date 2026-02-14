<template>
  <v-layout class="rounded rounded-md main-layout">
    <SessionDrawer v-model="drawerOpen" />
    
    <AppBar 
      @toggle-drawer="drawerOpen = !drawerOpen"
      @toggle-files="filePanelOpen = !filePanelOpen"
    />
    
    <v-main class="main-content">
      <div class="content-wrapper">
        <div class="chat-area" :class="{ 'with-panel': filePanelOpen }">
          <slot />
        </div>
        <FilePanel v-model:open="filePanelOpen" />
      </div>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SessionDrawer from './SessionDrawer.vue'
import AppBar from './AppBar.vue'
import FilePanel from '@/components/file/FilePanel.vue'

const drawerOpen = ref(true)
const filePanelOpen = ref(true)
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

.content-wrapper {
  display: flex;
  height: 100%;
  position: relative;
}

.chat-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease;
}

.chat-area.with-panel {
  margin-right: 320px;
}
</style>
