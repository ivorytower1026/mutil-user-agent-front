<template>
  <v-layout class="rounded rounded-md main-layout">
    <SessionDrawer v-model="drawerOpen" />
    
    <AppBar 
      @toggle-drawer="drawerOpen = !drawerOpen"
      @toggle-files="filePanelOpen = !filePanelOpen"
    />
    
    <v-main class="main-content">
      <div class="content-wrapper" ref="contentWrapperRef">
        <div class="chat-area" :class="{ 'with-panel': filePanelOpen }">
          <slot />
        </div>
        <FilePanel v-model:open="filePanelOpen" />
      </div>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SessionDrawer from './SessionDrawer.vue'
import AppBar from './AppBar.vue'
import FilePanel from '@/components/file/FilePanel.vue'

const drawerOpen = ref(true)
const filePanelOpen = ref(false)
const contentWrapperRef = ref<HTMLElement | null>(null)

function handleFilePanelResize(e: CustomEvent) {
  if (contentWrapperRef.value) {
    contentWrapperRef.value.style.setProperty('--file-panel-width', e.detail + 'px')
  }
}

onMounted(() => {
  if (contentWrapperRef.value) {
    contentWrapperRef.value.style.setProperty('--file-panel-width', '320px')
  }
  window.addEventListener('file-panel-resize', handleFilePanelResize as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('file-panel-resize', handleFilePanelResize as EventListener)
})
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
  --file-panel-width: 320px;
  display: flex;
  height: 100%;
  position: relative;
}

.chat-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-area.with-panel {
  margin-right: var(--file-panel-width);
}
</style>
