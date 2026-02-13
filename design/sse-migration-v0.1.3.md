# v0.1.3 前端 SSE 适配方案

> 版本: v0.1.3  
> 更新时间: 2026-02-13  
> 关联后端: `backend/design/v0_1_3_sse格式迁移`

---

## 概述

后端 SSE 格式已从旧格式迁移到官方 LangGraph 风格，前端需要适配新的 SSE 解析逻辑。

### 格式对比

| 旧格式 | 新格式 |
|--------|--------|
| `data: {"type": "content", ...}` | `event: messages/partial\ndata: {"content": "xxx"}` |

### 为什么不用官方 SDK

`@langchain/langgraph-sdk` 与当前后端不适配：

| 维度 | 当前后端 | SDK 期望 |
|------|---------|---------|
| API 端点 | `/api/chat/{thread_id}` | `/runs/stream` |
| 核心概念 | `thread_id` | `assistant_id` + `run_id` |
| 认证 | JWT Bearer | LangSmith API Key |

**结论**：自行实现轻量级 SSE 解析，约 50 行代码，完全适配当前后端。

---

## 事件类型映射

| 旧 type | 新 event | 说明 | data 结构 |
|---------|----------|------|-----------|
| `content` | `messages/partial` | LLM token 流 | `{"content": "xxx"}` 或 `{"is_final": true}` |
| `tool_start` | `tool/start` | 工具调用开始 | `{"tool": "name", "input": {...}}` |
| `tool_end` | `tool/end` | 工具调用结束 | `{"tool": "name", "output": {...}}` |
| `interrupt` | `interrupt` | HITL 中断 | `{"info": "..."}` |
| `update` | `updates` | 状态更新 | `{"data": {...}}` |
| `error` | `error` | 错误 | `{"message": "..."}` |
| `done` | `end` | 流结束 | `{}` |

---

## 代码改动

### 1. types/sse.ts - 类型定义

```typescript
// front/src/types/sse.ts

export type SSEEventName = 
  | 'messages/partial'
  | 'tool/start'
  | 'tool/end'
  | 'interrupt'
  | 'updates'
  | 'error'
  | 'end'

export interface SSEEvent {
  event: SSEEventName
  content?: string
  is_final?: boolean
  tool?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  info?: string
  message?: string
  data?: Record<string, unknown>
}
```

### 2. api/sse.ts - SSE 解析核心

```typescript
// front/src/api/sse.ts

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
    input: data.input as Record<string, unknown> | undefined,
    output: data.output as Record<string, unknown> | undefined,
    info: data.info as string | undefined,
    message: data.message as string | undefined,
    data: data.data as Record<string, unknown> | undefined,
  }
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
```

### 3. composables/useChatStream.ts - 事件处理

```typescript
// front/src/composables/useChatStream.ts

import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { streamChat, streamResume } from '@/api/sse'
import type { SSEEvent } from '@/types/sse'

export function useChatStream() {
  const chatStore = useChatStore()
  const sessionStore = useSessionStore()
  const abortController = ref<AbortController | null>(null)

  async function sendMessage(threadId: string, message: string) {
    if (!message.trim()) return

    chatStore.setLoading(true)
    chatStore.setError(null)
    chatStore.addUserMessage(message)
    chatStore.startAssistantMessage()
    sessionStore.incrementMessageCount(threadId)

    abortController.value = new AbortController()

    try {
      for await (const event of streamChat(threadId, message, abortController.value.signal)) {
        handleEvent(event)
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        console.log('Stream aborted')
      } else {
        chatStore.setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      chatStore.setLoading(false)
      abortController.value = null
    }
  }

  async function resumeInterrupt(threadId: string, action: 'continue' | 'cancel') {
    chatStore.setLoading(true)
    chatStore.clearInterrupt()
    
    abortController.value = new AbortController()

    try {
      for await (const event of streamResume(threadId, action, abortController.value.signal)) {
        handleEvent(event)
      }
    } catch (e: unknown) {
      chatStore.setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      chatStore.setLoading(false)
      abortController.value = null
    }
  }

  function handleEvent(event: SSEEvent) {
    switch (event.event) {
      case 'messages/partial':
        if (event.content) {
          chatStore.appendAssistantContent(event.content)
        }
        break

      case 'tool/start':
        if (event.tool && event.input) {
          chatStore.addToolCall({
            name: event.tool,
            args: event.input
          })
        }
        break

      case 'tool/end':
        if (event.tool) {
          chatStore.completeToolCall(event.tool, event.output)
        }
        break

      case 'interrupt':
        chatStore.setInterrupt({
          taskName: 'Unknown',
          info: event.info || '',
          data: event.data || { ...event }
        })
        if (sessionStore.currentThreadId) {
          sessionStore.updateSessionStatus(sessionStore.currentThreadId, 'interrupted')
        }
        break

      case 'updates':
        // 可选：处理状态更新
        break

      case 'error':
        chatStore.setError(event.message || 'Unknown error')
        break

      case 'end':
        if (sessionStore.currentThreadId) {
          sessionStore.updateSessionStatus(sessionStore.currentThreadId, 'idle')
        }
        break
    }
  }

  function stopStream() {
    if (abortController.value) {
      abortController.value.abort()
    }
  }

  return {
    sendMessage,
    resumeInterrupt,
    stopStream
  }
}
```

---

## 文件改动清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `front/src/types/sse.ts` | 修改 | 新增 `SSEEventName`，添加 `event` 字段 |
| `front/src/api/sse.ts` | 修改 | 重写 SSE 解析逻辑，支持 `event:` 行 |
| `front/src/composables/useChatStream.ts` | 修改 | 使用新事件名分发处理 |

---

## 测试验证

### 1. 启动后端

```bash
cd backend
uv run python main.py
```

### 2. 启动前端

```bash
cd front
npm run dev
```

### 3. 验证项

- [ ] 流式对话正常显示（token 逐字输出）
- [ ] 工具调用卡片正常展示（开始/结束状态）
- [ ] 中断确认弹窗正常工作
- [ ] 恢复中断后继续流式输出
- [ ] 错误信息正确显示
- [ ] 会话状态正确更新（idle/interrupted）

---

## 向后兼容

如果后端暂时未更新，可通过环境变量切换解析模式：

```typescript
// .env
VITE_SSE_LEGACY_MODE=true

// sse.ts
const LEGACY_MODE = import.meta.env.VITE_SSE_LEGACY_MODE === 'true'

function parseSSE(text: string): ParsedSSE[] {
  if (LEGACY_MODE) {
    // 旧格式解析逻辑
    return parseLegacySSE(text)
  }
  // 新格式解析逻辑
  return parseNewSSE(text)
}
```

---

## 参考资料

- 后端设计：`backend/design/v0_1_3_sse格式迁移/README.md`
- SSE 规范：https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
