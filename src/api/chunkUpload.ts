import api from './client'
import type { 
  InitUploadParams, 
  InitUploadResponse, 
  UploadChunkResponse,
  CompleteUploadParams,
  CompleteUploadResponse,
  UploadProgress
} from '@/types/file'

const CHUNK_THRESHOLD = 100 * 1024 * 1024

export function needsChunkUpload(fileSize: number): boolean {
  return fileSize > CHUNK_THRESHOLD
}

export async function initUpload(params: InitUploadParams): Promise<InitUploadResponse> {
  const response = await api.post<InitUploadResponse>('/api/files/init-upload', params)
  return response.data
}

export async function uploadChunk(
  uploadId: string,
  chunkIndex: number,
  chunk: Blob,
  token: string
): Promise<UploadChunkResponse> {
  const formData = new FormData()
  formData.append('upload_id', uploadId)
  formData.append('chunk_index', String(chunkIndex))
  formData.append('chunk', chunk)

  const response = await fetch('/api/files/upload-chunk', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Upload chunk failed: ${response.status}`)
  }

  return response.json()
}

export async function completeUpload(params: CompleteUploadParams): Promise<CompleteUploadResponse> {
  const response = await api.post<CompleteUploadResponse>('/api/files/complete-upload', params)
  return response.data
}

export async function cancelUpload(uploadId: string): Promise<void> {
  await api.delete(`/api/files/upload/${uploadId}`)
}

export interface ChunkUploadOptions {
  file: File
  targetPath: string
  token: string
  onProgress?: (progress: UploadProgress) => void
  chunkSize?: number
}

export async function uploadLargeFile(options: ChunkUploadOptions): Promise<string> {
  const { file, targetPath, token, onProgress, chunkSize = 10 * 1024 * 1024 } = options
  
  const totalChunks = Math.ceil(file.size / chunkSize)
  
  const initRes = await initUpload({
    filename: file.name,
    total_chunks: totalChunks,
    total_size: file.size,
    target_path: targetPath
  })
  
  const uploadId = initRes.upload_id
  let uploadedChunks = 0
  const startTime = Date.now()
  
  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      await uploadChunk(uploadId, i, chunk, token)
      uploadedChunks++
      
      const elapsed = (Date.now() - startTime) / 1000
      const uploadedBytes = Math.min(end, file.size)
      const speed = uploadedBytes / elapsed
      const remaining = (file.size - uploadedBytes) / speed
      
      onProgress?.({
        uploaded: uploadedChunks,
        total: totalChunks,
        percent: Math.round((uploadedChunks / totalChunks) * 100),
        speed: formatSpeed(speed),
        remaining: formatTime(remaining)
      })
    }
    
    const completeRes = await completeUpload({
      upload_id: uploadId,
      target_path: targetPath
    })
    
    return completeRes.path
  } catch (error) {
    await cancelUpload(uploadId).catch(() => {})
    throw error
  }
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--'
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
  return `${Math.round(seconds / 3600)}小时`
}
