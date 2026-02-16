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

interface ParsedSSE {
  event: string
  data: Record<string, unknown>
}

function parseSSE(text: string): ParsedSSE[] {
  const events: ParsedSSE[] = []
  const lines = text.split('\n')
  let currentEvent = ''

  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      const dataStr = line.slice(5).trim()
      if (dataStr && currentEvent) {
        try {
          const data = JSON.parse(dataStr)
          events.push({ event: currentEvent, data })
          currentEvent = ''
        } catch (e) {
          console.error('Failed to parse SSE data:', dataStr, e)
        }
      }
    }
  }

  return events
}

function mapEventToSSEEvent(parsed: ParsedSSE): SSEEvent {
  const { event, data } = parsed
  return {
    event: event as SSEEvent['event'],
    content: data.content as string | undefined,
    is_final: data.is_final as boolean | undefined,
    tool: data.tool as string | undefined,
    status: data.status as 'running' | 'completed' | undefined,
    info: data.info as string | undefined,
    message: data.message as string | undefined,
    data: data.data as Record<string, unknown> | undefined,
    title: data.title as string | undefined,
    questions: data.questions as SSEEvent['questions'],
  }
}

export async function* streamChat(
  threadId: string,
  message: string,
  files?: string[],
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const token = getToken()
  
  const response = await fetch(`${BASE_URL}/api/chat/${threadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ message, files }),
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
      
      const lastNewline = buffer.lastIndexOf('\n')
      if (lastNewline >= 0) {
        const toProcess = buffer.slice(0, lastNewline)
        buffer = buffer.slice(lastNewline + 1)
        
        const parsedEvents = parseSSE(toProcess)
        for (const parsed of parsedEvents) {
          yield mapEventToSSEEvent(parsed)
        }
      }
    }

    if (buffer.trim()) {
      const parsedEvents = parseSSE(buffer)
      for (const parsed of parsedEvents) {
        yield mapEventToSSEEvent(parsed)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function* streamResume(
  threadId: string,
  action: string,
  answers?: string[],
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const token = getToken()
  
  const body: Record<string, unknown> = { action }
  if (answers) {
    body.answers = answers
  }
  
  const response = await fetch(`${BASE_URL}/api/resume/${threadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
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
      
      const lastNewline = buffer.lastIndexOf('\n')
      if (lastNewline >= 0) {
        const toProcess = buffer.slice(0, lastNewline)
        buffer = buffer.slice(lastNewline + 1)
        
        const parsedEvents = parseSSE(toProcess)
        for (const parsed of parsedEvents) {
          yield mapEventToSSEEvent(parsed)
        }
      }
    }

    if (buffer.trim()) {
      const parsedEvents = parseSSE(buffer)
      for (const parsed of parsedEvents) {
        yield mapEventToSSEEvent(parsed)
      }
    }
  } finally {
    reader.releaseLock()
  }
}
