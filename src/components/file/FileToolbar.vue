<template>
  <div class="file-toolbar">
    <div class="left-actions">
      <v-btn
        prepend-icon="mdi-folder-plus"
        variant="text"
        size="small"
        @click="$emit('new-folder')"
      >
        新建文件夹
      </v-btn>
      
      <v-btn
        prepend-icon="mdi-upload"
        variant="text"
        size="small"
        @click="$emit('upload')"
      >
        上传
      </v-btn>
    </div>
    
    <div class="right-actions">
      <v-btn-toggle
        v-model="localViewMode"
        density="compact"
        mandatory
      >
        <v-btn value="list" size="small">
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <v-btn value="grid" size="small">
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ViewMode } from '@/types/file'

const props = defineProps<{
  viewMode?: ViewMode
}>()

const emit = defineEmits<{
  'new-folder': []
  'upload': []
  'update:view-mode': [mode: ViewMode]
}>()

const localViewMode = ref<ViewMode>(props.viewMode || 'list')

watch(() => props.viewMode, (val) => {
  if (val) localViewMode.value = val
})

watch(localViewMode, (val) => {
  emit('update:view-mode', val)
})
</script>

<style scoped>
.file-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.left-actions {
  display: flex;
  gap: 4px;
}

.right-actions {
  display: flex;
  align-items: center;
}

.v-theme--dark .file-toolbar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
</style>
