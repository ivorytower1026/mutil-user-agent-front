<template>
  <div ref="panelRef" class="file-panel" :class="{ collapsed: !open, 'is-resizing': isResizing }">
    <div 
      class="resize-handle resize-handle-left"
      @mousedown="handleStartResize"
    />
    <div class="panel-header">
      <span class="title">文件管理</span>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        density="compact"
        @click="$emit('update:open', false)"
      />
    </div>
    
    <template v-if="open">
      <FileBreadcrumb
        :path="fileStore.currentPath"
        @navigate="handleNavigate"
        @refresh="handleRefresh"
      />
      
      <FileToolbar
        :view-mode="fileStore.viewMode"
        @new-folder="showNewFolder = true"
        @upload="triggerUpload"
        @update:view-mode="fileStore.setViewMode"
      />
      
      <FileUploadZone @files="handleFilesDrop">
        <FileList
          :items="fileStore.sortedItems"
          :loading="fileStore.loading"
          :view-mode="fileStore.viewMode"
          :selected-items="fileStore.selectedItems"
          @item-click="handleItemClick"
          @item-dblclick="handleItemDblClick"
          @context-menu="handleContextMenu"
          @toggle-select="fileStore.toggleSelection"
        />
      </FileUploadZone>
      
      <UploadQueue
        v-if="fileStore.uploadQueue.length > 0"
        :tasks="fileStore.uploadQueue"
        @clear-completed="fileStore.clearCompletedUploads"
        @remove="fileStore.removeUploadTask"
      />
    </template>
    
    <input
      ref="fileInput"
      type="file"
      multiple
      hidden
      @change="handleFileSelect"
    />
    
    <NewFolderDialog
      v-model="showNewFolder"
      @create="handleCreateFolder"
    />
    
    <RenameDialog
      v-model="showRename"
      :current-name="renameItem?.name"
      @rename="handleRename"
    />
    
    <FilePreview
      v-model="showPreview"
      :file="fileStore.previewFile"
      @download="handleDownload"
    />
    
    <FileContextMenu
      v-model="showContextMenu"
      :item="contextMenuItem"
      :target="contextMenuPosition"
      @download="handleDownload"
      @preview="handlePreview"
      @rename="handleOpenRename"
      @delete="handleDelete"
    />
    
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          确定要删除 "{{ deleteItem?.name }}" 吗？此操作无法撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">取消</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFileStore } from '@/stores/file'
import { useWebDAV } from '@/composables/useWebDAV'
import { useFileUpload } from '@/composables/useFileUpload'
import type { FileItem } from '@/types/file'
import { downloadFile } from '@/api/webdav'

import FileBreadcrumb from './FileBreadcrumb.vue'
import FileToolbar from './FileToolbar.vue'
import FileUploadZone from './FileUploadZone.vue'
import FileList from './FileList.vue'
import UploadQueue from './UploadQueue.vue'
import NewFolderDialog from './NewFolderDialog.vue'
import RenameDialog from './RenameDialog.vue'
import FilePreview from './FilePreview.vue'
import FileContextMenu from './FileContextMenu.vue'

const INITIAL_WIDTH = 320
const MIN_WIDTH = 280
const MAX_WIDTH = 500

defineProps<{
  open: boolean
}>()

const fileStore = useFileStore()
const { uploadFiles } = useFileUpload()
useWebDAV()

const panelRef = ref<HTMLElement | null>(null)
const isResizing = ref(false)
let currentWidth = INITIAL_WIDTH

function dispatchResizeEvent(width: number) {
  window.dispatchEvent(new CustomEvent('file-panel-resize', { detail: width }))
}

onMounted(() => {
  dispatchResizeEvent(INITIAL_WIDTH)
  if (panelRef.value) {
    panelRef.value.style.width = INITIAL_WIDTH + 'px'
  }
})

function handleStartResize(e: MouseEvent) {
  if (!panelRef.value) return
  e.preventDefault()
  isResizing.value = true
  const startX = e.clientX
  const startWidth = currentWidth

  function handleMouseMove(e: MouseEvent) {
    const delta = startX - e.clientX
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
    currentWidth = newWidth
    dispatchResizeEvent(newWidth)
    if (panelRef.value) {
      panelRef.value.style.width = newWidth + 'px'
    }
  }

  function handleMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', handleMouseMove, { passive: true })
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const fileInput = ref<HTMLInputElement | null>(null)
const showNewFolder = ref(false)
const showRename = ref(false)
const showPreview = ref(false)
const showContextMenu = ref(false)
const showDeleteConfirm = ref(false)
const renameItem = ref<FileItem | null>(null)
const deleteItem = ref<FileItem | null>(null)
const contextMenuItem = ref<FileItem | null>(null)
const contextMenuPosition = ref<[number, number] | undefined>(undefined)

function handleNavigate(path: string) {
  fileStore.navigateTo(path)
}

function handleRefresh() {
  fileStore.loadDirectory(fileStore.currentPath)
}

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    uploadFiles(input.files)
  }
  input.value = ''
}

function handleFilesDrop(files: FileList) {
  uploadFiles(files)
}

function handleItemClick(item: FileItem, event: MouseEvent) {
  if (event.ctrlKey || event.metaKey) {
    fileStore.toggleSelection(item.path)
  } else {
    fileStore.clearSelection()
    fileStore.toggleSelection(item.path)
  }
}

function handleItemDblClick(item: FileItem) {
  if (item.type === 'directory') {
    fileStore.navigateTo(item.path)
  } else {
    handlePreview(item)
  }
}

function handleContextMenu(item: FileItem, event: MouseEvent) {
  contextMenuItem.value = item
  contextMenuPosition.value = [event.clientX, event.clientY]
  showContextMenu.value = true
}

function handleCreateFolder(name: string) {
  fileStore.createNewFolder(name)
}

function handleOpenRename(item: FileItem) {
  renameItem.value = item
  showRename.value = true
}

function handleRename(newName: string) {
  if (renameItem.value) {
    fileStore.rename(renameItem.value.path, newName)
    renameItem.value = null
  }
}

function handlePreview(item: FileItem) {
  fileStore.setPreviewFile(item)
  showPreview.value = true
}

async function handleDownload(item: FileItem) {
  try {
    const blob = await downloadFile(item.path)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

function handleDelete(item: FileItem) {
  deleteItem.value = item
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (deleteItem.value) {
    await fileStore.deleteByPath(deleteItem.value.path)
    deleteItem.value = null
  }
  showDeleteConfirm.value = false
}
</script>

<style scoped>
.file-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.file-panel.collapsed {
  width: 0 !important;
  overflow: hidden;
  border-left: none;
}

.file-panel.is-resizing {
  transition: none !important;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover {
  background-color: rgba(var(--v-theme-primary), 0.3);
}

.resize-handle-left {
  left: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.panel-header .title {
  font-size: 14px;
  font-weight: 600;
}

.v-theme--dark .file-panel {
  background-color: #1e1e1e;
  border-left-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .panel-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
</style>
