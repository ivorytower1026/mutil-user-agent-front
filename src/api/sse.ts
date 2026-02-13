import type { SSEEvent, ResumeRequest } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getToken(): string | null {
  const stored = sessionStorage.getItem('auth')
  if (stored) {
    try {
      const auth = JSON.parse(stored)
      return auth.token || null
    } catch {
      return null
    }
  }
  return null
}

export async function* streamChat(
  threadId: string,
  message: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const token = getToken()
  
  const response = await fetch(`${BASE_URL}/api/chat/${threadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ message }),
    signal
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6).trim()
            if (jsonStr) {
              yield JSON.parse(jsonStr) as SSEEvent
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', line, e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function* streamResume(
  threadId: string,
  action: 'continue' | 'cancel',
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const token = getToken()
  
  const response = await fetch(`${BASE_URL}/api/resume/${threadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ action } as ResumeRequest),
    signal
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6).trim()
            if (jsonStr) {
              yield JSON.parse(jsonStr) as SSEEvent
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', line, e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
