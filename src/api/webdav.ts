import { createClient, WebDAVClient } from 'webdav'
import type { FileItem } from '@/types/file'

let client: WebDAVClient | null = null

export function initWebDAVClient(token: string): WebDAVClient {
  client = createClient('/dav', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return client
}

export function getWebDAVClient(): WebDAVClient {
  if (!client) {
    throw new Error('WebDAV client not initialized. Call initWebDAVClient first.')
  }
  return client
}

export function resetWebDAVClient(): void {
  client = null
}

export async function listDirectory(path: string): Promise<FileItem[]> {
  const dav = getWebDAVClient()
  const items = await dav.getDirectoryContents(path)
  
  if (!Array.isArray(items)) {
    return []
  }
  
  return items.map((item) => ({
    name: item.basename,
    path: item.filename,
    type: item.type as 'file' | 'directory',
    size: item.type === 'file' ? item.size : null,
    modified: item.lastmod,
    etag: item.etag || null,
    mimeType: item.mime || undefined
  }))
}

export async function createDirectory(path: string): Promise<boolean> {
  const dav = getWebDAVClient()
  await dav.createDirectory(path)
  return true
}

export async function deleteItem(path: string): Promise<boolean> {
  const dav = getWebDAVClient()
  await dav.deleteFile(path)
  return true
}

export async function moveItem(source: string, destination: string): Promise<boolean> {
  const dav = getWebDAVClient()
  await dav.moveFile(source, destination)
  return true
}

export async function uploadFile(path: string, content: ArrayBuffer | string): Promise<string> {
  const dav = getWebDAVClient()
  await dav.putFileContents(path, content)
  return path
}

export async function downloadFile(path: string): Promise<Blob> {
  const dav = getWebDAVClient()
  const content = await dav.getFileContents(path, { format: 'binary' })
  if (content instanceof ArrayBuffer) {
    return new Blob([content])
  }
  if (typeof content === 'string') {
    return new Blob([content], { type: 'text/plain' })
  }
  return new Blob([content as ArrayBuffer])
}

export async function fileExists(path: string): Promise<boolean> {
  const dav = getWebDAVClient()
  try {
    return await dav.exists(path)
  } catch {
    return false
  }
}
