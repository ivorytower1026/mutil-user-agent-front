<template>
  <div 
    class="file-upload-zone"
    :class="{ 'drag-over': isDragOver }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <slot />
    
    <div v-if="isDragOver" class="drop-overlay">
      <v-icon size="48" color="primary">mdi-cloud-upload</v-icon>
      <span>释放以上传文件</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  files: [files: FileList]
}>()

const isDragOver = ref(false)
let dragCounter = 0

function handleDragEnter() {
  dragCounter++
  isDragOver.value = true
}

function handleDragOver(e: DragEvent) {
  e.dataTransfer!.dropEffect = 'copy'
}

function handleDragLeave() {
  dragCounter--
  if (dragCounter === 0) {
    isDragOver.value = false
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  dragCounter = 0
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('files', files)
  }
}
</script>

<style scoped>
.file-upload-zone {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-upload-zone.drag-over {
  background-color: rgba(25, 118, 210, 0.05);
}

.drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(25, 118, 210, 0.1);
  border: 2px dashed rgba(25, 118, 210, 0.5);
  border-radius: 8px;
  margin: 8px;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
}

.v-theme--dark .file-upload-zone.drag-over {
  background-color: rgba(33, 150, 243, 0.1);
}

.v-theme--dark .drop-overlay {
  background-color: rgba(33, 150, 243, 0.15);
  border-color: rgba(33, 150, 243, 0.5);
}
</style>
