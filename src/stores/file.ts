import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { FileItem, UploadTask, ViewMode } from '@/types/file'
import { 
  listDirectory, 
  createDirectory, 
  deleteItem, 
  moveItem 
} from '@/api/webdav'

export const useFileStore = defineStore('file', () => {
  const currentPath = ref('/')
  const items = ref<FileItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedItems = ref<Set<string>>(new Set())
  const uploadQueue = ref<UploadTask[]>([])
  const panelOpen = ref(true)
  const viewMode = ref<ViewMode>('list')
  const previewFile = ref<FileItem | null>(null)

  const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  })

  const uploadingCount = computed(() => 
    uploadQueue.value.filter(t => t.status === 'uploading' || t.status === 'pending').length
  )

  const hasUploading = computed(() => 
    uploadQueue.value.some(t => t.status === 'uploading' || t.status === 'pending')
  )

  async function loadDirectory(path: string) {
    loading.value = true
    error.value = null
    selectedItems.value.clear()
    
    try {
      items.value = await listDirectory(path)
      currentPath.value = path
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载目录失败'
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function createNewFolder(name: string) {
    const path = currentPath.value === '/' 
      ? `/${name}` 
      : `${currentPath.value}/${name}`
    
    await createDirectory(path)
    await loadDirectory(currentPath.value)
  }

  async function deleteSelected() {
    const paths = Array.from(selectedItems.value)
    for (const path of paths) {
      await deleteItem(path)
    }
    selectedItems.value.clear()
    await loadDirectory(currentPath.value)
  }

  async function deleteByPath(path: string) {
    await deleteItem(path)
    await loadDirectory(currentPath.value)
  }

  async function rename(path: string, newName: string) {
    const parentPath = path.substring(0, path.lastIndexOf('/'))
    const destPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`
    await moveItem(path, destPath)
    await loadDirectory(currentPath.value)
  }

  async function move(source: string, destination: string) {
    await moveItem(source, destination)
    await loadDirectory(currentPath.value)
  }

  function addToUploadQueue(file: File, targetPath: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const isChunked = file.size > 100 * 1024 * 1024
    
    uploadQueue.value.push({
      id,
      file,
      path: targetPath,
      progress: 0,
      status: 'pending',
      isChunked,
      startTime: Date.now(),
      uploadedBytes: 0
    })
  }

  function updateUploadTask(id: string, updates: Partial<UploadTask>) {
    const index = uploadQueue.value.findIndex(t => t.id === id)
    if (index !== -1) {
      uploadQueue.value[index] = { ...uploadQueue.value[index], ...updates }
    }
  }

  function removeUploadTask(id: string) {
    const index = uploadQueue.value.findIndex(t => t.id === id)
    if (index !== -1) {
      uploadQueue.value.splice(index, 1)
    }
  }

  function clearCompletedUploads() {
    uploadQueue.value = uploadQueue.value.filter(t => 
      t.status !== 'completed' && t.status !== 'failed'
    )
  }

  function toggleSelection(path: string) {
    if (selectedItems.value.has(path)) {
      selectedItems.value.delete(path)
    } else {
      selectedItems.value.add(path)
    }
  }

  function selectAll() {
    items.value.forEach(item => {
      selectedItems.value.add(item.path)
    })
  }

  function clearSelection() {
    selectedItems.value.clear()
  }

  function navigateTo(path: string) {
    loadDirectory(path)
  }

  function goUp() {
    if (currentPath.value === '/') return
    const parentPath = currentPath.value.substring(0, currentPath.value.lastIndexOf('/'))
    loadDirectory(parentPath || '/')
  }

  function setPreviewFile(file: FileItem | null) {
    previewFile.value = file
  }

  function togglePanel() {
    panelOpen.value = !panelOpen.value
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  return {
    currentPath,
    items,
    loading,
    error,
    selectedItems,
    uploadQueue,
    panelOpen,
    viewMode,
    previewFile,
    sortedItems,
    uploadingCount,
    hasUploading,
    loadDirectory,
    createNewFolder,
    deleteSelected,
    deleteByPath,
    rename,
    move,
    addToUploadQueue,
    updateUploadTask,
    removeUploadTask,
    clearCompletedUploads,
    toggleSelection,
    selectAll,
    clearSelection,
    navigateTo,
    goUp,
    setPreviewFile,
    togglePanel,
    setViewMode
  }
})
