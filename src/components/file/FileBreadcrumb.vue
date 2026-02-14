<template>
  <div class="file-breadcrumb">
    <v-btn
      icon="mdi-chevron-left"
      variant="text"
      size="small"
      :disabled="path === '/'"
      @click="goUp"
    />
    
    <div class="breadcrumb-items">
      <span
        class="breadcrumb-item root"
        @click="navigate('/')"
      >
        <v-icon size="18">mdi-home</v-icon>
      </span>
      
      <template v-for="(part, index) in pathParts" :key="index">
        <v-icon size="14" class="separator">mdi-chevron-right</v-icon>
        <span
          class="breadcrumb-item"
          :class="{ active: index === pathParts.length - 1 }"
          @click="navigateToPart(index)"
        >
          {{ part }}
        </span>
      </template>
    </div>
    
    <v-btn
      icon="mdi-refresh"
      variant="text"
      size="small"
      @click="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  path: string
}>()

const emit = defineEmits<{
  navigate: [path: string]
  refresh: []
}>()

const pathParts = computed(() => {
  return props.path
    .split('/')
    .filter(Boolean)
})

function navigate(path: string) {
  emit('navigate', path)
}

function navigateToPart(index: number) {
  const path = '/' + pathParts.value.slice(0, index + 1).join('/')
  emit('navigate', path)
}

function goUp() {
  if (props.path === '/') return
  const parentPath = props.path.substring(0, props.path.lastIndexOf('/'))
  emit('navigate', parentPath || '/')
}

function refresh() {
  emit('refresh')
}
</script>

<style scoped>
.file-breadcrumb {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  gap: 4px;
}

.breadcrumb-items {
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
}

.breadcrumb-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.2s;
}

.breadcrumb-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.87);
}

.breadcrumb-item.active {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
}

.breadcrumb-item.root {
  display: flex;
  align-items: center;
}

.separator {
  color: rgba(0, 0, 0, 0.3);
}

.v-theme--dark .file-breadcrumb {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .breadcrumb-item {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .breadcrumb-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .breadcrumb-item.active {
  color: rgba(255, 255, 255, 0.87);
}

.v-theme--dark .separator {
  color: rgba(255, 255, 255, 0.3);
}
</style>
