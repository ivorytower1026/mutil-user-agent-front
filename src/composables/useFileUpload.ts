import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFileStore } from '@/stores/file'
import { uploadFile, downloadFile } from '@/api/webdav'
import { uploadLargeFile } from '@/api/chunkUpload'
import type { UploadProgress } from '@/types/file'

export function useFileUpload() {
  const authStore = useAuthStore()
  const fileStore = useFileStore()

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      const targetPath = fileStore.currentPath === '/' 
        ? `/${file.name}` 
        : `${fileStore.currentPath}/${file.name}`
      
      fileStore.addToUploadQueue(file, targetPath)
    }
    
    processQueue()
  }

  async function processQueue() {
    const pendingTasks = fileStore.uploadQueue.filter(t => t.status === 'pending')
    
    for (const task of pendingTasks) {
      if (task.status !== 'pending') continue
      
      fileStore.updateUploadTask(task.id, { status: 'uploading' })
      
      try {
        if (task.isChunked) {
          const token = authStore.token || ''
          await uploadLargeFile({
            file: task.file,
            targetPath: task.path,
            token: token,
            onProgress: (progress: UploadProgress) => {
              fileStore.updateUploadTask(task.id, {
                progress: progress.percent,
                uploadedBytes: progress.uploaded * (task.file.size / progress.total)
              })
            }
          })
        } else {
          const content = await task.file.arrayBuffer()
          await uploadFile(task.path, content)
        }
        
        fileStore.updateUploadTask(task.id, { 
          status: 'completed', 
          progress: 100 
        })
        
        fileStore.loadDirectory(fileStore.currentPath)
      } catch (error) {
        fileStore.updateUploadTask(task.id, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : '上传失败' 
        })
      }
    }
  }

  async function downloadFiles(paths: string | string[]) {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    
    for (const path of pathArray) {
      try {
        const blob = await downloadFile(path)
        const filename = path.split('/').pop() || 'download'
        triggerDownload(blob, filename)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  watch(
    () => fileStore.uploadQueue,
    () => {
      const hasPending = fileStore.uploadQueue.some(t => t.status === 'pending')
      if (hasPending && !fileStore.uploadQueue.some(t => t.status === 'uploading')) {
        processQueue()
      }
    },
    { deep: true }
  )

  return {
    uploadFiles,
    downloadFiles,
    processQueue
  }
}
