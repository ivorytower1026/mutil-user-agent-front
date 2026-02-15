export interface FileItem {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number | null
  modified: string
  etag: string | null
  mimeType?: string
}

export interface UploadTask {
  id: string
  file: File
  path: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
  isChunked: boolean
  startTime?: number
  uploadedBytes?: number
  speed?: number
}

export interface UploadProgress {
  uploaded: number
  total: number
  percent: number
  speed?: string
  remaining?: string
}

export interface InitUploadParams {
  filename: string
  total_chunks: number
  total_size: number
  target_path?: string
}

export interface InitUploadResponse {
  upload_id: string
  chunk_size: number
}

export interface UploadChunkResponse {
  success: boolean
  chunk_index: number
  received_count: number
}

export interface CompleteUploadParams {
  upload_id: string
  target_path?: string
}

export interface CompleteUploadResponse {
  success: boolean
  path: string
}

export type ViewMode = 'list' | 'grid'

export const CHUNK_SIZE = 10 * 1024 * 1024
export const CHUNK_THRESHOLD = 100 * 1024 * 1024

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
export const TEXT_EXTENSIONS = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'csv', 'log']
export const CODE_EXTENSIONS = ['js', 'ts', 'vue', 'jsx', 'tsx', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'h', 'css', 'scss', 'less', 'html', 'sql', 'sh', 'bash']

export function getImageUrl(path: string): string {
  return `/dav${path}`
}

export function isImage(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return IMAGE_EXTENSIONS.includes(ext)
}

export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return TEXT_EXTENSIONS.includes(ext) || CODE_EXTENSIONS.includes(ext)
}

export function isCodeFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return CODE_EXTENSIONS.includes(ext)
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-'
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 0) {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
