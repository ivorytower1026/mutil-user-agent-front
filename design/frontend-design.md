# Multi-tenant AI Agent Platform - 前端设计文档

> 版本: v1.0  
> 更新时间: 2026-02-13  
> 技术栈: Vue 3 + TypeScript + Vuetify 3 + Pinia + Vite

---

## 目录

1. [技术选型与决策](#1-技术选型与决策)
2. [项目结构](#2-项目结构)
3. [类型定义](#3-类型定义)
4. [API层设计](#4-api层设计)
5. [状态管理](#5-状态管理)
6. [Composables设计](#6-composables设计)
7. [路由与认证](#7-路由与认证)
8. [组件设计](#8-组件设计)
9. [SSE流处理](#9-sse流处理)
10. [HITL中断处理](#10-hitl中断处理)
11. [主题系统](#11-主题系统)
12. [实现计划](#12-实现计划)

---

## 1. 技术选型与决策

### 1.1 核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.4 | 前端框架 |
| vuetify | ^3.5 | UI组件库 |
| pinia | ^2.1 | 状态管理 |
| vue-router | ^4.2 | 路由管理 |
| axios | ^1.6 | HTTP请求 |
| marked | ^12.0 | Markdown渲染 |
| highlight.js | ^11.9 | 代码高亮 |
| @mdi/font | ^7.4 | 图标库 |

### 1.2 关键技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| JWT存储 | `sessionStorage` | 关闭浏览器自动清除，减少XSS持久化风险 |
| 主题系统 | Vuetify内置 | 使用`useTheme()`实现全局亮/暗色切换 |
| 会话历史 | 每次API拉取 | 无需前端持久化，简化状态管理 |
| 工具调用展示 | 可折叠，默认展开 | 复杂输出可折叠，方便查看 |

### 1.3 与后端API对应关系

| 前端功能 | 后端接口 | 方法 |
|----------|----------|------|
| 用户注册 | `/api/auth/register` | POST |
| 用户登录 | `/api/auth/login` | POST |
| 创建会话 | `/api/sessions` | POST |
| 发送消息 | `/api/chat/{thread_id}` | POST (SSE) |
| 恢复中断 | `/api/resume/{thread_id}` | POST (SSE) |
| 获取状态 | `/api/status/{thread_id}` | GET |
| 获取历史 | `/api/history/{thread_id}` | GET |

---

## 2. 项目结构

```
front/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── .env
├── .env.development
├── .env.production
├── design/                           # 设计文档
│   └── frontend-design.md
│
└── src/
    ├── main.ts                       # 应用入口
    ├── App.vue                       # 根组件
    ├── vite-env.d.ts                 # Vite类型声明
    │
    ├── api/                          # API请求层
    │   ├── index.ts                  # Axios实例 + 拦截器
    │   ├── auth.ts                   # 认证API
    │   ├── chat.ts                   # 会话API
    │   └── sse.ts                    # SSE流封装
    │
    ├── composables/                  # 组合式函数
    │   ├── useAuth.ts                # 认证逻辑
    │   ├── useChatStream.ts          # 聊天流处理
    │   └── useTheme.ts               # 主题切换
    │
    ├── stores/                       # Pinia状态管理
    │   ├── auth.ts                   # 认证状态
    │   ├── session.ts                # 会话列表状态
    │   └── chat.ts                   # 聊天消息状态
    │
    ├── types/                        # TypeScript类型
    │   ├── api.ts                    # API相关类型
    │   ├── chat.ts                   # 聊天相关类型
    │   └── sse.ts                    # SSE事件类型
    │
    ├── components/                   # 组件
    │   ├── common/
    │   │   ├── AppLogo.vue
    │   │   └── ThemeToggle.vue
    │   │
    │   ├── auth/
    │   │   ├── LoginForm.vue
    │   │   └── RegisterForm.vue
    │   │
    │   ├── layout/
    │   │   ├── MainLayout.vue
    │   │   ├── AppBar.vue
    │   │   └── SessionDrawer.vue
    │   │
    │   ├── chat/
    │   │   ├── ChatContainer.vue
    │   │   ├── MessageList.vue
    │   │   ├── MessageItem.vue
    │   │   ├── MarkdownRenderer.vue
    │   │   ├── ChatInput.vue
    │   │   ├── ToolCallCard.vue
    │   │   └── LoadingDots.vue
    │   │
    │   └── interrupt/
    │       ├── InterruptDialog.vue
    │       └── InterruptDetail.vue
    │
    ├── views/                        # 页面视图
    │   ├── LoginView.vue
    │   └── ChatView.vue
    │
    ├── router/                       # 路由
    │   └── index.ts
    │
    └── plugins/                      # 插件配置
        └── vuetify.ts
```

---

## 3. 类型定义

### 3.1 API类型 (`src/types/api.ts`)

```typescript
// 认证相关
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  message: string
  user_id: string
}

// 会话相关
export interface CreateSessionResponse {
  thread_id: string
}

export interface ThreadStatus {
  thread_id: string
  status: 'idle' | 'interrupted'
  has_pending_tasks: boolean
  interrupt_info: InterruptInfo | null
  message_count: number
}

export interface InterruptInfo {
  task_name: string
  interrupts: string[]
}

// 历史消息
export interface HistoryResponse {
  thread_id: string
  messages: ApiMessage[]
}

export interface ApiMessage {
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
}
```

### 3.2 聊天类型 (`src/types/chat.ts`)

```typescript
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: unknown
  timestamp: Date
}

export interface Interrupt {
  taskName: string
  info: string
  data?: Record<string, unknown>
}

export interface Session {
  threadId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  status: 'idle' | 'interrupted'
  title?: string
}
```

### 3.3 SSE类型 (`src/types/sse.ts`)

```typescript
export type SSEEventType = 
  | 'content' 
  | 'tool_start' 
  | 'tool_end' 
  | 'interrupt' 
  | 'done' 
  | 'error'
  | 'update'

export interface SSEEvent {
  type: SSEEventType
  // content事件
  content?: string
  is_final?: boolean
  // tool_start/tool_end事件
  tool?: string
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  // interrupt事件
  info?: string
  // error事件
  message?: string
}

export interface ResumeRequest {
  action: 'continue' | 'cancel'
}
```

---

## 4. API层设计

### 4.1 Axios实例 (`src/api/index.ts`)

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// 创建Axios实例
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动附加JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 4.2 认证API (`src/api/auth.ts`)

```typescript
import api from './index'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/api'

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/api/auth/register', data)
    return response.data
  }
}
```

### 4.3 会话API (`src/api/chat.ts`)

```typescript
import api from './index'
import type { 
  CreateSessionResponse, 
  ThreadStatus, 
  HistoryResponse,
  ResumeRequest 
} from '@/types/api'

export const chatApi = {
  async createSession(): Promise<CreateSessionResponse> {
    const response = await api.post<CreateSessionResponse>('/api/sessions')
    return response.data
  },

  async getStatus(threadId: string): Promise<ThreadStatus> {
    const response = await api.get<ThreadStatus>(`/api/status/${threadId}`)
    return response.data
  },

  async getHistory(threadId: string): Promise<HistoryResponse> {
    const response = await api.get<HistoryResponse>(`/api/history/${threadId}`)
    return response.data
  }
}
```

### 4.4 SSE封装 (`src/api/sse.ts`)

```typescript
import type { SSEEvent, ResumeRequest } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getToken(): string | null {
  const stored = sessionStorage.getItem('auth')
  if (stored) {
    try {
      const auth = JSON.parse(stored)
      return auth.token
    } catch {
      return null
    }
  }
  return null
}

/**
 * SSE流式聊天
 * 使用fetch + ReadableStream实现流式读取
 */
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
      
      // 解析SSE格式: "data: {...}\n\n"
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

/**
 * SSE流式恢复中断
 */
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
```

---

## 5. 状态管理

### 5.1 认证Store (`src/stores/auth.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AuthState {
  token: string | null
  userId: string | null
  username: string | null
}

const STORAGE_KEY = 'auth'

export const useAuthStore = defineStore('auth', () => {
  // 从sessionStorage初始化状态
  const loadStoredAuth = (): AuthState => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return { token: null, userId: null, username: null }
  }

  const stored = loadStoredAuth()
  
  const token = ref<string | null>(stored.token)
  const userId = ref<string | null>(stored.userId)
  const username = ref<string | null>(stored.username)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setAuth(data: { token: string; userId: string; username: string }) {
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    
    // 持久化到sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.token,
      userId: data.userId,
      username: data.username
    }))
  }

  function logout() {
    token.value = null
    userId.value = null
    username.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return {
    token,
    userId,
    username,
    isAuthenticated,
    setAuth,
    logout
  }
})
```

### 5.2 会话Store (`src/stores/session.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@/types/chat'
import { chatApi } from '@/api/chat'

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([])
  const currentThreadId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentSession = computed(() => 
    sessions.value.find(s => s.threadId === currentThreadId.value)
  )

  async function createSession() {
    isLoading.value = true
    try {
      const response = await chatApi.createSession()
      const newSession: Session = {
        threadId: response.thread_id,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
        status: 'idle'
      }
      sessions.value.unshift(newSession)
      currentThreadId.value = response.thread_id
      return response.thread_id
    } finally {
      isLoading.value = false
    }
  }

  function setCurrentThread(threadId: string) {
    currentThreadId.value = threadId
  }

  function updateSessionStatus(threadId: string, status: 'idle' | 'interrupted') {
    const session = sessions.value.find(s => s.threadId === threadId)
    if (session) {
      session.status = status
      session.updatedAt = new Date()
    }
  }

  function incrementMessageCount(threadId: string) {
    const session = sessions.value.find(s => s.threadId === threadId)
    if (session) {
      session.messageCount++
      session.updatedAt = new Date()
    }
  }

  return {
    sessions,
    currentThreadId,
    currentSession,
    isLoading,
    createSession,
    setCurrentThread,
    updateSessionStatus,
    incrementMessageCount
  }
})
```

### 5.3 聊天Store (`src/stores/chat.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, ToolCall, Interrupt } from '@/types/chat'
import { chatApi } from '@/api/chat'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const interrupt = ref<Interrupt | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const streamingContent = ref('')

  // 添加用户消息
  function addUserMessage(content: string) {
    messages.value.push({
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    })
  }

  // 添加助手消息(开始流式输出)
  function startAssistantMessage() {
    streamingContent.value = ''
    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    })
  }

  // 追加流式内容
  function appendAssistantContent(chunk: string) {
    streamingContent.value += chunk
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content = streamingContent.value
    }
  }

  // 添加工具调用
  function addToolCall(toolCall: { name: string; args: Record<string, unknown> }) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      if (!lastMessage.toolCalls) {
        lastMessage.toolCalls = []
      }
      lastMessage.toolCalls.push({
        id: generateId(),
        name: toolCall.name,
        args: toolCall.args,
        status: 'running',
        timestamp: new Date()
      })
    }
  }

  // 完成工具调用
  function completeToolCall(toolName: string, output: unknown) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.toolCalls) {
      const toolCall = lastMessage.toolCalls.find(tc => tc.name === toolName && tc.status === 'running')
      if (toolCall) {
        toolCall.status = 'completed'
        toolCall.output = output
      }
    }
  }

  // 设置中断
  function setInterrupt(data: Interrupt) {
    interrupt.value = data
  }

  // 清除中断
  function clearInterrupt() {
    interrupt.value = null
  }

  // 设置加载状态
  function setLoading(value: boolean) {
    isLoading.value = value
  }

  // 设置错误
  function setError(msg: string | null) {
    error.value = msg
  }

  // 清空消息
  function clearMessages() {
    messages.value = []
    streamingContent.value = ''
  }

  // 从API加载历史消息
  async function loadHistory(threadId: string) {
    try {
      const response = await chatApi.getHistory(threadId)
      messages.value = response.messages.map((msg, index) => ({
        id: `history-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      }))
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  return {
    messages,
    interrupt,
    isLoading,
    error,
    streamingContent,
    addUserMessage,
    startAssistantMessage,
    appendAssistantContent,
    addToolCall,
    completeToolCall,
    setInterrupt,
    clearInterrupt,
    setLoading,
    setError,
    clearMessages,
    loadHistory
  }
})
```

---

## 6. Composables设计

### 6.1 useAuth (`src/composables/useAuth.ts`)

```typescript
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import type { LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const username = computed(() => authStore.username)
  const userId = computed(() => authStore.userId)

  async function login(credentials: LoginRequest) {
    const response = await authApi.login(credentials)
    authStore.setAuth({
      token: response.access_token,
      userId: credentials.username, // 后端user_id = username
      username: credentials.username
    })
    return response
  }

  async function register(data: RegisterRequest) {
    const response = await authApi.register(data)
    return response
  }

  function logout() {
    authStore.logout()
    router.push('/login')
  }

  return {
    isAuthenticated,
    username,
    userId,
    login,
    register,
    logout
  }
}
```

### 6.2 useChatStream (`src/composables/useChatStream.ts`)

```typescript
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { streamChat, streamResume } from '@/api/sse'
import type { SSEEvent } from '@/types/sse'

export function useChatStream() {
  const chatStore = useChatStore()
  const sessionStore = useSessionStore()
  const abortController = ref<AbortController | null>(null)

  // 发送消息
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

  // 恢复中断
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

  // 处理SSE事件
  function handleEvent(event: SSEEvent) {
    switch (event.type) {
      case 'content':
        if (event.content) {
          chatStore.appendAssistantContent(event.content)
        }
        break

      case 'tool_start':
        if (event.tool && event.input) {
          chatStore.addToolCall({
            name: event.tool,
            args: event.input
          })
        }
        break

      case 'tool_end':
        if (event.tool) {
          chatStore.completeToolCall(event.tool, event.output)
        }
        break

      case 'interrupt':
        chatStore.setInterrupt({
          taskName: 'Unknown',
          info: event.info || '',
          data: event
        })
        sessionStore.updateSessionStatus(
          sessionStore.currentThreadId!, 
          'interrupted'
        )
        break

      case 'error':
        chatStore.setError(event.message || 'Unknown error')
        break

      case 'done':
        // 流结束
        if (sessionStore.currentThreadId) {
          sessionStore.updateSessionStatus(
            sessionStore.currentThreadId, 
            'idle'
          )
        }
        break
    }
  }

  // 停止流
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

### 6.3 useTheme (`src/composables/useTheme.ts`)

```typescript
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'

const THEME_KEY = 'app-theme'

export function useAppTheme() {
  const theme = useTheme()

  const isDark = computed(() => theme.global.current.value.dark)

  function toggleTheme() {
    const newTheme = isDark.value ? 'light' : 'dark'
    theme.global.name.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && (saved === 'light' || saved === 'dark')) {
      theme.global.name.value = saved
    } else {
      // 跟随系统
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.global.name.value = prefersDark ? 'dark' : 'light'
    }
  }

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
```

---

## 7. 路由与认证

### 7.1 路由配置 (`src/router/index.ts`)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true, title: 'AI Agent' }
  },
  {
    path: '/thread/:id',
    name: 'Thread',
    component: () => import('@/views/ChatView.vue'),
    meta: { requiresAuth: true, title: '对话' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 认证守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI Agent Platform`
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // 已登录访问登录页
    next({ name: 'Chat' })
  } else {
    next()
  }
})

export default router
```

---

## 8. 组件设计

### 8.1 组件层级关系

```
App.vue
├── MainLayout.vue
│   ├── AppBar.vue
│   │   ├── AppLogo.vue
│   │   ├── ThemeToggle.vue
│   │   └── UserMenu
│   │
│   ├── SessionDrawer.vue (左侧)
│   │   └── SessionItem.vue (v-for)
│   │
│   └── ChatContainer.vue (主内容)
│       ├── MessageList.vue
│       │   └── MessageItem.vue (v-for)
│       │       ├── MarkdownRenderer.vue
│       │       └── ToolCallCard.vue
│       │
│       ├── InterruptDialog.vue
│       │   └── InterruptDetail.vue
│       │
│       ├── LoadingDots.vue
│       └── ChatInput.vue
│
└── LoginView.vue (无Layout)
    ├── LoginForm.vue
    └── RegisterForm.vue
```

### 8.2 核心组件Props/Events

#### MessageItem.vue

```typescript
// Props
interface Props {
  message: Message
  isStreaming?: boolean
}

// 无Events，纯展示
```

#### ToolCallCard.vue

```typescript
// Props
interface Props {
  toolCall: ToolCall
  defaultExpanded?: boolean  // 默认true
}

// 无Events，可折叠面板
```

#### ChatInput.vue

```typescript
// Props
interface Props {
  disabled?: boolean
  placeholder?: string
}

// Events
defineEmits<{
  send: [message: string]
}>()
```

#### InterruptDialog.vue

```typescript
// Props
interface Props {
  modelValue: boolean      // v-model
  interrupt: Interrupt | null
}

// Events
defineEmits<{
  'update:modelValue': [value: boolean]
  continue: []
  cancel: []
}>()
```

### 8.3 Vuetify组件使用

| 功能 | Vuetify组件 |
|------|-------------|
| 主布局 | `<v-layout>`, `<v-navigation-drawer>`, `<v-main>` |
| 顶部栏 | `<v-app-bar>` |
| 按钮 | `<v-btn>` |
| 输入框 | `<v-textarea>`, `<v-text-field>` |
| 卡片 | `<v-card>` |
| 对话框 | `<v-dialog>` |
| 列表 | `<v-list>`, `<v-list-item>` |
| 折叠面板 | `<v-expansion-panels>` |
| 图标 | `<v-icon>` |
| 加载 | `<v-progress-circular>` |
| 提示 | `<v-snackbar>` |

---

## 9. SSE流处理

### 9.1 后端SSE格式

后端返回格式：
```
data: {"type":"content","content":"Hello"}

data: {"type":"tool_start","tool":"execute","input":{"command":"ls -la"}}

data: {"type":"tool_end","tool":"execute","output":{"stdout":"file1.txt\nfile2.txt"}}

data: {"type":"interrupt","info":"需要确认执行命令"}

data: {"type":"done"}

data: {"type":"error","message":"Something went wrong"}
```

### 9.2 前端处理流程

```
┌──────────────────────────────────────────────────────────────┐
│  用户输入消息                                                 │
│      ↓                                                       │
│  chatStore.addUserMessage()                                  │
│  chatStore.startAssistantMessage()                           │
│      ↓                                                       │
│  for await (event of streamChat())                           │
│      │                                                       │
│      ├─ type: content   → appendAssistantContent()           │
│      ├─ type: tool_start → addToolCall()                     │
│      ├─ type: tool_end   → completeToolCall()                │
│      ├─ type: interrupt  → setInterrupt() + 显示弹窗         │
│      ├─ type: done       → 流结束                            │
│      └─ type: error      → setError()                        │
│      ↓                                                       │
│  chatStore.setLoading(false)                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. HITL中断处理

### 10.1 处理流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                        HITL中断处理流程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SSE事件流                                                       │
│     │                                                           │
│     ▼                                                           │
│  ┌─────────────────┐                                            │
│  │ type: interrupt │                                            │
│  │ info: "..."     │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────┐                                        │
│  │ chatStore.interrupt │ ← 保存中断信息                         │
│  │ = { info, data }    │                                        │
│  └────────┬────────────┘                                        │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────────────┐                                   │
│  │   InterruptDialog.vue    │                                   │
│  │   自动弹出 (v-model)      │                                   │
│  │  ┌────────────────────┐  │                                   │
│  │  │ ⚠️ 需要人工确认    │  │                                   │
│  │  │ ─────────────────  │  │                                   │
│  │  │ 工具: execute      │  │                                   │
│  │  │ 参数:              │  │                                   │
│  │  │  command: "rm -rf" │  │                                   │
│  │  │                    │  │                                   │
│  │  │ [取消]  [继续执行] │  │                                   │
│  │  └────────────────────┘  │                                   │
│  └────────┬─────────────────┘                                   │
│           │                                                     │
│     ┌─────┴─────┐                                               │
│     │           │                                               │
│     ▼           ▼                                               │
│ [取消]       [继续]                                             │
│     │           │                                               │
│     │           │                                               │
│     ▼           ▼                                               │
│ resumeInterrupt  resumeInterrupt                                │
│ (action:cancel)  (action:continue)                              │
│     │           │                                               │
│     └─────┬─────┘                                               │
│           │                                                     │
│           ▼                                                     │
│  POST /api/resume/{thread_id}                                   │
│  Body: { action: "continue" | "cancel" }                        │
│           │                                                     │
│           ▼                                                     │
│  继续SSE流式接收...                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 InterruptDialog.vue 核心逻辑

```vue
<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        需要人工确认
      </v-card-title>
      
      <v-card-text>
        <InterruptDetail :interrupt="interrupt" />
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn 
          color="error" 
          variant="outlined"
          @click="handleCancel"
        >
          取消执行
        </v-btn>
        <v-btn 
          color="primary" 
          variant="flat"
          @click="handleContinue"
        >
          继续执行
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Interrupt } from '@/types/chat'

const props = defineProps<{
  modelValue: boolean
  interrupt: Interrupt | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  continue: []
  cancel: []
}>()

function handleContinue() {
  emit('continue')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
```

---

## 11. 主题系统

### 11.1 Vuetify主题配置 (`src/plugins/vuetify.ts`)

```typescript
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#FFFFFF',
          surface: '#FFFFFF'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#121212',
          surface: '#1E1E1E'
        }
      }
    }
  }
})
```

### 11.2 主题切换组件 (`src/components/common/ThemeToggle.vue`)

```vue
<template>
  <v-btn 
    icon 
    variant="text"
    @click="toggleTheme"
  >
    <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    <v-tooltip activator="parent">
      {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { useAppTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useAppTheme()
</script>
```

---

## 12. 实现计划

### 12.1 阶段划分

| 阶段 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| **Phase 1: 基础设施** | | | 2h |
| 1.1 | 项目初始化 | `package.json`, `vite.config.ts` | 0.5h |
| 1.2 | Vuetify配置 | `src/plugins/vuetify.ts`, `main.ts` | 0.5h |
| 1.3 | 类型定义 | `src/types/*.ts` | 0.5h |
| 1.4 | API实例 | `src/api/index.ts` | 0.5h |
| **Phase 2: 认证系统** | | | 2h |
| 2.1 | 认证Store | `src/stores/auth.ts` | 0.5h |
| 2.2 | 认证API | `src/api/auth.ts` | 0.5h |
| 2.3 | 登录/注册页面 | `src/views/LoginView.vue`, `src/components/auth/*` | 1h |
| **Phase 3: 路由系统** | | | 1h |
| 3.1 | 路由配置 | `src/router/index.ts` | 0.5h |
| 3.2 | 认证守卫 | `src/router/index.ts` | 0.5h |
| **Phase 4: SSE流处理** | | | 2h |
| 4.1 | SSE封装 | `src/api/sse.ts` | 1h |
| 4.2 | useChatStream | `src/composables/useChatStream.ts` | 1h |
| **Phase 5: 聊天Store** | | | 1.5h |
| 5.1 | Chat Store | `src/stores/chat.ts` | 1h |
| 5.2 | Session Store | `src/stores/session.ts` | 0.5h |
| **Phase 6: 聊天UI** | | | 4h |
| 6.1 | 主布局 | `src/components/layout/*` | 1h |
| 6.2 | 消息列表 | `src/components/chat/MessageList.vue` | 0.5h |
| 6.3 | 消息项 | `src/components/chat/MessageItem.vue` | 0.5h |
| 6.4 | Markdown渲染 | `src/components/chat/MarkdownRenderer.vue` | 1h |
| 6.5 | 输入框 | `src/components/chat/ChatInput.vue` | 0.5h |
| 6.6 | 聊天容器 | `src/components/chat/ChatContainer.vue` | 0.5h |
| **Phase 7: 工具调用展示** | | | 1.5h |
| 7.1 | 工具调用卡片 | `src/components/chat/ToolCallCard.vue` | 1h |
| 7.2 | 折叠/展开 | - | 0.5h |
| **Phase 8: HITL中断** | | | 1.5h |
| 8.1 | 中断对话框 | `src/components/interrupt/InterruptDialog.vue` | 1h |
| 8.2 | 中断详情 | `src/components/interrupt/InterruptDetail.vue` | 0.5h |
| **Phase 9: 会话管理** | | | 1.5h |
| 9.1 | 会话抽屉 | `src/components/layout/SessionDrawer.vue` | 1h |
| 9.2 | 新建会话 | - | 0.5h |
| **Phase 10: 主题系统** | | | 1h |
| 10.1 | 主题Composable | `src/composables/useTheme.ts` | 0.5h |
| 10.2 | 主题切换组件 | `src/components/common/ThemeToggle.vue` | 0.5h |
| **Phase 11: 集成测试** | | | 2h |
| 11.1 | 端到端测试 | - | 1h |
| 11.2 | Bug修复 | - | 1h |

**总计: 约20小时**

### 12.2 开发顺序依赖图

```
Phase 1 (基础设施)
    │
    ├── Phase 2 (认证系统) ── Phase 3 (路由)
    │                              │
    │                              ▼
    └── Phase 4 (SSE) ───────► Phase 5 (Store)
                                   │
                                   ▼
                              Phase 6 (聊天UI)
                                   │
                        ┌──────────┼──────────┐
                        ▼          ▼          ▼
                   Phase 7     Phase 8    Phase 9
                  (工具调用)   (HITL)     (会话管理)
                        │          │          │
                        └──────────┼──────────┘
                                   ▼
                              Phase 10 (主题)
                                   │
                                   ▼
                              Phase 11 (测试)
```

---

## 附录

### A. 环境变量配置

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8002

# .env.production
VITE_API_BASE_URL=
```

### B. Vite配置参考

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8002',
        changeOrigin: true
      }
    }
  }
})
```

### C. package.json依赖

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vuetify": "^3.5.0",
    "pinia": "^2.1.0",
    "vue-router": "^4.2.0",
    "axios": "^1.6.0",
    "marked": "^12.0.0",
    "highlight.js": "^11.9.0",
    "@mdi/font": "^7.4.0",
    "vue-codemirror": "^6.0.0",
    "@codemirror/lang-javascript": "^6.0.0",
    "@codemirror/lang-python": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/lang-html": "^6.0.0",
    "@codemirror/lang-css": "^6.0.0",
    "@codemirror/lang-json": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "vite-plugin-vuetify": "^2.0.0"
  }
}
```

---

## 13. 文件预览与编辑功能

> 更新时间: 2026-02-15

### 13.1 功能概述

文件预览组件支持以下文件类型：
- **图片**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`
- **PDF**: `.pdf`
- **文本**: `.txt`, `.md`, `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.html`, `.htm`, `.css`, `.json`, `.xml`, `.yaml`, `.yml`, `.sh`, `.bat`, `.log`, `.ini`, `.conf`, `.env`

### 13.2 文件预览认证方案

#### 问题背景

原始实现中，图片和 PDF 预览通过 URL 查询参数传递 token：
```javascript
// ❌ 问题代码
const previewUrl = `${url}?token=${encodeURIComponent(token)}`
```

这种方式存在以下问题：
1. 后端返回 401 错误（后端不支持 URL 参数认证）
2. Token 暴露在 URL 中，存在安全隐患

#### 解决方案

改用 `fetch` + `Blob` + `URL.createObjectURL` 方式：

```javascript
// ✅ 正确实现
async function loadImageContent() {
  const blob = await downloadFile(props.file.path)  // downloadFile 使用 Authorization header
  const typedBlob = new Blob([blob], { type: 'image/png' })
  imageBlobUrl.value = URL.createObjectURL(typedBlob)
}
```

#### 关键点

1. **MIME Type 必须正确设置**：
   - PDF: `application/pdf`
   - 图片: 根据扩展名设置对应的 MIME type

2. **内存管理**：对话框关闭时必须调用 `URL.revokeObjectURL()` 释放 blob URL

```javascript
watch(() => props.modelValue, (val) => {
  if (!val) {
    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = ''
    }
    if (imageBlobUrl.value) {
      URL.revokeObjectURL(imageBlobUrl.value)
      imageBlobUrl.value = ''
    }
  }
})
```

### 13.3 CodeMirror 文本编辑器集成

#### 安装依赖

```bash
npm install vue-codemirror \
  @codemirror/lang-javascript \
  @codemirror/lang-python \
  @codemirror/lang-markdown \
  @codemirror/lang-html \
  @codemirror/lang-css \
  @codemirror/lang-json \
  @codemirror/theme-one-dark
```

#### 语言支持配置

```typescript
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { markdown } from '@codemirror/lang-markdown'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

const extensions = computed(() => {
  const ext = props.file.name.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, unknown> = {
    js: javascript(),
    jsx: javascript({ jsx: true }),
    ts: javascript({ typescript: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    py: python(),
    md: markdown(),
    html: html(),
    htm: html(),
    css: css(),
    json: json()
  }
  const langExt = langMap[ext] || javascript()
  return [langExt, oneDark]
})
```

#### 保存功能

```typescript
async function handleSave() {
  if (!props.file || saving.value) return
  
  saving.value = true
  
  try {
    await uploadFile(props.file.path, textContent.value)
    notification.success('保存成功')
  } catch (e) {
    notification.error('保存失败')
  } finally {
    saving.value = false
  }
}
```

#### 快捷键支持

```vue
<v-dialog @keydown.ctrl.s.prevent="handleSave">
```

### 13.4 全局通知组件

#### Store 定义 (`src/stores/notification.ts`)

```typescript
import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const color = ref<'success' | 'error' | 'warning' | 'info'>('success')

export function useNotification() {
  function notify(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    message.value = msg
    color.value = type
    show.value = true
  }

  function success(msg: string) { notify(msg, 'success') }
  function error(msg: string) { notify(msg, 'error') }
  function warning(msg: string) { notify(msg, 'warning') }
  function info(msg: string) { notify(msg, 'info') }
  function close() { show.value = false }

  return { show, message, color, notify, success, error, warning, info, close }
}
```

#### 组件定义 (`src/components/common/AppSnackbar.vue`)

```vue
<template>
  <v-snackbar
    v-model="show"
    :color="color"
    :timeout="2000"
    location="top center"
  >
    {{ message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotification } from '@/stores/notification'
const { show, message, color } = useNotification()
</script>
```

#### 在 App.vue 中注册

```vue
<template>
  <v-app>
    <router-view />
    <AppSnackbar />
  </v-app>
</template>
```

### 13.5 FilePreview 组件完整结构

```
FilePreview.vue
├── v-dialog (max-width: 1200, max-height: 95vh)
│   ├── v-card
│   │   ├── v-card-title
│   │   │   ├── 文件名
│   │   │   ├── 保存按钮 (仅文本文件)
│   │   │   ├── 下载按钮
│   │   │   └── 关闭按钮
│   │   │
│   │   └── v-card-text.preview-content (padding: 0)
│   │       ├── loading-state (加载中)
│   │       ├── error-state (错误)
│   │       ├── img (图片预览)
│   │       ├── iframe (PDF预览)
│   │       ├── Codemirror (文本编辑)
│   │       └── unsupported-state (不支持类型)
│   │
│   └── AppSnackbar (全局通知，在 App.vue 中)
```

### 13.6 样式要点

```css
.preview-content {
  min-height: 400px;
  max-height: calc(95vh - 100px);
  overflow: hidden;
  padding: 0 !important;  /* 移除默认 padding，让内容占满 */
}

.preview-content.has-text {
  align-items: flex-start;  /* 文本编辑器从顶部开始，不居中 */
}

.preview-editor {
  width: 100%;
  height: calc(95vh - 100px);
  overflow: hidden;
}

.preview-editor :deep(.cm-editor) {
  height: 100%;
}

.preview-editor :deep(.cm-scroller) {
  overflow: auto;
}
```

### 13.7 相关文件列表

| 文件路径 | 说明 |
|---------|------|
| `src/components/file/FilePreview.vue` | 文件预览/编辑主组件 |
| `src/stores/notification.ts` | 全局通知 store |
| `src/components/common/AppSnackbar.vue` | 全局通知组件 |
| `src/api/webdav.ts` | WebDAV 文件操作 API |
| `src/types/file.ts` | 文件相关类型定义 |
