<template>
  <div class="file-list" :class="{ 'grid-view': viewMode === 'grid' }">
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate size="32" />
      <span>加载中...</span>
    </div>
    
    <div v-else-if="items.length === 0" class="empty-state">
      <v-icon size="48" color="grey-lighten-1">mdi-folder-outline</v-icon>
      <span>此文件夹为空</span>
    </div>
    
    <template v-else>
      <div
        v-for="item in items"
        :key="item.path"
        class="file-item"
        :class="{ 
          selected: isSelected(item.path),
          directory: item.type === 'directory'
        }"
        @click="handleClick(item, $event)"
        @dblclick="handleDoubleClick(item)"
        @contextmenu.prevent="handleContextMenu(item, $event)"
      >
        <v-checkbox
          v-if="viewMode === 'list'"
          :model-value="isSelected(item.path)"
          density="compact"
          hide-details
          @click.stop
          @update:model-value="toggleSelect(item.path)"
        />
        
        <div class="file-icon">
          <v-icon :color="getIconColor(item)" :size="viewMode === 'grid' ? 48 : 24">
            {{ getIcon(item) }}
          </v-icon>
        </div>
        
        <div class="file-info">
          <span class="file-name">{{ item.name }}</span>
          <span v-if="viewMode === 'list'" class="file-meta">
            {{ item.type === 'file' ? formatSize(item.size) : '' }}
            {{ formatModified(item.modified) }}
          </span>
        </div>
        
        <v-btn
          v-if="viewMode === 'list'"
          icon="mdi-dots-vertical"
          variant="text"
          size="small"
          @click.stop="handleContextMenu(item, $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileItem } from '@/types/file'
import { formatFileSize, formatDate, isImage, isTextFile, isCodeFile } from '@/types/file'

const props = defineProps<{
  items: FileItem[]
  loading?: boolean
  viewMode?: 'list' | 'grid'
  selectedItems?: Set<string>
}>()

const emit = defineEmits<{
  'item-click': [item: FileItem, event: MouseEvent]
  'item-dblclick': [item: FileItem]
  'context-menu': [item: FileItem, event: MouseEvent]
  'toggle-select': [path: string]
}>()

const selectedSet = computed(() => props.selectedItems || new Set<string>())

function isSelected(path: string): boolean {
  return selectedSet.value.has(path)
}

function getIcon(item: FileItem): string {
  if (item.type === 'directory') return 'mdi-folder'
  
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  
  if (isImage(item.name)) return 'mdi-file-image'
  if (ext === 'pdf') return 'mdi-file-pdf-box'
  if (isCodeFile(item.name)) return 'mdi-file-code'
  if (isTextFile(item.name)) return 'mdi-file-document'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'mdi-file-archive'
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return 'mdi-file-music'
  if (['mp4', 'avi', 'mkv', 'mov'].includes(ext)) return 'mdi-file-video'
  
  return 'mdi-file'
}

function getIconColor(item: FileItem): string {
  if (item.type === 'directory') return 'amber-darken-2'
  
  const ext = item.name.split('.').pop()?.toLowerCase() || ''
  
  if (isImage(item.name)) return 'blue'
  if (ext === 'pdf') return 'red'
  if (isCodeFile(item.name)) return 'green'
  if (['zip', 'rar', '7z'].includes(ext)) return 'orange'
  if (['mp3', 'wav'].includes(ext)) return 'purple'
  if (['mp4', 'avi'].includes(ext)) return 'pink'
  
  return 'grey'
}

function formatSize(size: number | null): string {
  return formatFileSize(size)
}

function formatModified(date: string): string {
  return formatDate(date)
}

function handleClick(item: FileItem, event: MouseEvent) {
  emit('item-click', item, event)
}

function handleDoubleClick(item: FileItem) {
  emit('item-dblclick', item)
}

function handleContextMenu(item: FileItem, event: MouseEvent) {
  emit('context-menu', item, event)
}

function toggleSelect(path: string) {
  emit('toggle-select', path)
}
</script>

<style scoped>
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
  color: rgba(0, 0, 0, 0.4);
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
  gap: 12px;
}

.file-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.file-item.selected {
  background-color: rgba(25, 118, 210, 0.08);
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  display: flex;
  gap: 12px;
}

.file-list.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.file-list.grid-view .file-item {
  flex-direction: column;
  padding: 16px 8px;
  text-align: center;
}

.file-list.grid-view .file-name {
  font-size: 12px;
  word-break: break-word;
}

.v-theme--dark .file-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .file-item.selected {
  background-color: rgba(33, 150, 243, 0.16);
}

.v-theme--dark .file-meta {
  color: rgba(255, 255, 255, 0.5);
}
</style>
