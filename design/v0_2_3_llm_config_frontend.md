# v0.2.3 LLM 配置管理 - 前端适配方案

## 背景

后端已完成 LLM 动态配置功能（v0.2.3），支持通过 Admin API 动态配置 LLM 提供商（Ollama、VLLM、OpenAI、智谱AI）。

前端需要新增 LLM 配置管理页面，允许 Admin 用户：
- 查看所有 LLM 配置
- 创建/编辑/删除配置
- 激活指定配置
- 测试 LLM 连接

## 后端 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/admin/llm/configs` | GET | 列出所有 LLM 配置（支持 role/provider 筛选） |
| `/api/admin/llm/configs` | POST | 创建新配置 |
| `/api/admin/llm/configs/{id}` | GET | 获取配置详情 |
| `/api/admin/llm/configs/{id}` | PUT | 更新配置 |
| `/api/admin/llm/configs/{id}` | DELETE | 删除配置 |
| `/api/admin/llm/configs/{id}/activate` | POST | 激活配置（同角色其他自动停用） |
| `/api/admin/llm/test` | POST | 测试 LLM 连接 |

## 文件改动清单

| 层级 | 文件路径 | 操作 | 说明 |
|------|----------|------|------|
| **类型** | `src/types/llm.ts` | 新建 | LLM 配置相关 TypeScript 类型 |
| **API** | `src/api/llm.ts` | 新建 | LLM 配置 API 调用封装 |
| **Store** | `src/stores/llm.ts` | 新建 | LLM 配置 Pinia 状态管理 |
| **页面** | `src/views/admin/AdminLlm.vue` | 新建 | LLM 配置管理主页面 |
| **组件** | `src/components/admin/LlmConfigDialog.vue` | 新建 | 新增/编辑配置对话框 |
| **组件** | `src/components/admin/LlmTestDialog.vue` | 新建 | 连接测试对话框 |
| **路由** | `src/router/index.ts` | 修改 | 添加 LLM 配置路由 |
| **布局** | `src/views/admin/AdminLayout.vue` | 修改 | 添加侧边栏导航项 |

## 类型定义

### `src/types/llm.ts`

```typescript
export type LlmProvider = 'ollama' | 'vllm' | 'openai' | 'zhipuai'
export type LlmRole = 'big' | 'flash'

export interface LlmConfig {
  id: string
  name: string
  display_name?: string
  description?: string
  provider: LlmProvider
  base_url: string
  model_name: string
  temperature: number
  max_tokens: number
  extra_params: Record<string, unknown>
  role: LlmRole
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface LlmConfigCreate {
  name: string
  display_name?: string
  description?: string
  provider: LlmProvider
  base_url: string
  api_key: string
  model_name: string
  temperature?: number
  max_tokens?: number
  extra_params?: Record<string, unknown>
  role: LlmRole
  activate?: boolean
}

export interface LlmConfigUpdate {
  display_name?: string
  description?: string
  base_url?: string
  api_key?: string
  model_name?: string
  temperature?: number
  max_tokens?: number
  extra_params?: Record<string, unknown>
}

export interface LlmTestRequest {
  base_url: string
  api_key: string
  model_name: string
}

export interface LlmTestResult {
  success: boolean
  message: string
  response_time_ms?: number
  response_preview?: string
}

export interface LlmConfigListResponse {
  configs: LlmConfig[]
  total: number
}
```

## API 层

### `src/api/llm.ts`

```typescript
import api from './client'
import type { 
  LlmConfig, 
  LlmConfigCreate, 
  LlmConfigUpdate,
  LlmConfigListResponse,
  LlmTestRequest,
  LlmTestResult
} from '@/types/llm'

const BASE = '/api/admin/llm'

export const llmApi = {
  async list(params?: { role?: string; provider?: string }): Promise<LlmConfigListResponse> {
    const response = await api.get<LlmConfigListResponse>(BASE, { params })
    return response.data
  },

  async get(id: string): Promise<LlmConfig> {
    const response = await api.get<LlmConfig>(`${BASE}/${id}`)
    return response.data
  },

  async create(data: LlmConfigCreate): Promise<LlmConfig> {
    const response = await api.post<LlmConfig>(`${BASE}/configs`, data)
    return response.data
  },

  async update(id: string, data: LlmConfigUpdate): Promise<LlmConfig> {
    const response = await api.put<LlmConfig>(`${BASE}/configs/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE}/configs/${id}`)
  },

  async activate(id: string): Promise<LlmConfig> {
    const response = await api.post<LlmConfig>(`${BASE}/configs/${id}/activate`)
    return response.data
  },

  async test(data: LlmTestRequest): Promise<LlmTestResult> {
    const response = await api.post<LlmTestResult>(`${BASE}/test`, data)
    return response.data
  }
}
```

## Store 层

### `src/stores/llm.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { llmApi } from '@/api/llm'
import type { LlmConfig, LlmConfigCreate, LlmConfigUpdate, LlmTestRequest, LlmTestResult } from '@/types/llm'

export const useLlmStore = defineStore('llm', () => {
  const configs = ref<LlmConfig[]>([])
  const isLoading = ref(false)
  const total = ref(0)

  async function fetchConfigs(filters?: { role?: string; provider?: string }) {
    isLoading.value = true
    try {
      const response = await llmApi.list(filters)
      configs.value = response.configs
      total.value = response.total
    } finally {
      isLoading.value = false
    }
  }

  async function createConfig(data: LlmConfigCreate) {
    const config = await llmApi.create(data)
    await fetchConfigs()
    return config
  }

  async function updateConfig(id: string, data: LlmConfigUpdate) {
    const config = await llmApi.update(id, data)
    await fetchConfigs()
    return config
  }

  async function deleteConfig(id: string) {
    await llmApi.delete(id)
    await fetchConfigs()
  }

  async function activateConfig(id: string) {
    const config = await llmApi.activate(id)
    await fetchConfigs()
    return config
  }

  async function testConnection(data: LlmTestRequest): Promise<LlmTestResult> {
    return await llmApi.test(data)
  }

  return {
    configs,
    isLoading,
    total,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    testConnection
  }
})
```

## 页面设计

### `src/views/admin/AdminLlm.vue`

**页面布局：**

```
┌─────────────────────────────────────────────────────────────┐
│  LLM 配置管理                              [测试连接] [添加] │
├─────────────────────────────────────────────────────────────┤
│  筛选: [角色 ▼] [Provider ▼]                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 名称          │ Provider │ 模型        │ 角色 │ 状态 │ 操作 │
│  ├─────────────────────────────────────────────────────────┤│
│  │ ollama-llama3 │ ollama   │ llama3      │ big  │ [●]  │ ... │
│  │ vllm-qwen     │ vllm     │ Qwen2.5-72B │ flash│ [○]  │ ... │
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**表格列定义：**

| 列名 | 字段 | 说明 |
|------|------|------|
| 名称 | name | 显示 name + display_name |
| Provider | provider | Chip 显示，不同颜色 |
| 模型 | model_name | 模型名称 |
| 角色 | role | big=主模型, flash=快速模型 |
| 状态 | is_active | Switch 开关，切换激活状态 |
| 操作 | - | 测试/编辑/删除 |

**Provider 颜色映射：**

| Provider | 颜色 |
|----------|------|
| ollama | success (绿色) |
| vllm | primary (蓝色) |
| openai | warning (橙色) |
| zhipuai | info (青色) |

**角色颜色映射：**

| 角色 | 颜色 |
|------|------|
| big | error (红色) - 主模型 |
| flash | success (绿色) - 快速模型 |

## 对话框组件

### `src/components/admin/LlmConfigDialog.vue`

**表单字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | text | 是 | 配置名称（唯一） |
| display_name | text | 否 | 显示名称 |
| description | textarea | 否 | 描述 |
| provider | select | 是 | ollama/vllm/openai/zhipuai |
| base_url | text | 是 | API 地址 |
| api_key | text | 是 | API 密钥（密码类型） |
| model_name | text | 是 | 模型名称 |
| temperature | number | 否 | 温度参数，默认 0.7 |
| max_tokens | number | 否 | 最大 token，默认 4096 |
| role | select | 是 | big/flash |
| activate | checkbox | 否 | 创建后立即激活 |

**Provider 默认 base_url：**

| Provider | 默认 base_url |
|----------|---------------|
| ollama | http://localhost:11434/v1 |
| vllm | http://localhost:8000/v1 |
| openai | https://api.openai.com/v1 |
| zhipuai | https://open.bigmodel.cn/api/paas/v4 |

**交互逻辑：**
1. 选择 provider 后自动填充默认 base_url
2. 编辑模式不允许修改 name 和 role
3. api_key 字段显示为密码类型
4. 底部按钮：取消 / 保存

### `src/components/admin/LlmTestDialog.vue`

**表单字段：**

| 字段 | 类型 | 必填 |
|------|------|------|
| base_url | text | 是 |
| api_key | text | 是 |
| model_name | text | 是 |

**测试结果显示：**
- 成功：绿色图标，显示响应时间
- 失败：红色图标，显示错误信息

## 路由配置

### `src/router/index.ts` 修改

在 `/admin` 的 children 数组中添加：

```typescript
{
  path: 'llm',
  name: 'AdminLlm',
  component: () => import('@/views/admin/AdminLlm.vue'),
  meta: { title: 'LLM 配置' }
}
```

## 侧边栏导航

### `src/views/admin/AdminLayout.vue` 修改

在导航列表中添加：

```vue
<v-list-item
  to="/admin/llm"
  prepend-icon="mdi-brain"
  title="LLM 配置"
  value="llm"
/>
```

## 目录结构

```
src/
├── types/
│   └── llm.ts                    # 新建
├── api/
│   └── llm.ts                    # 新建
├── stores/
│   └── llm.ts                    # 新建
├── components/admin/
│   ├── LlmConfigDialog.vue       # 新建
│   └── LlmTestDialog.vue         # 新建
├── views/admin/
│   ├── AdminLayout.vue           # 修改
│   └── AdminLlm.vue              # 新建
└── router/
    └── index.ts                  # 修改
```

## 实施步骤

1. **Step 1**: 创建类型定义 `src/types/llm.ts`
2. **Step 2**: 创建 API 层 `src/api/llm.ts`
3. **Step 3**: 创建 Store 层 `src/stores/llm.ts`
4. **Step 4**: 创建配置对话框 `src/components/admin/LlmConfigDialog.vue`
5. **Step 5**: 创建测试对话框 `src/components/admin/LlmTestDialog.vue`
6. **Step 6**: 创建主页面 `src/views/admin/AdminLlm.vue`
7. **Step 7**: 修改路由 `src/router/index.ts`
8. **Step 8**: 修改侧边栏 `src/views/admin/AdminLayout.vue`
9. **Step 9**: 测试验证

## 参考文件

可参考现有 MCP 配置管理页面的实现：
- `src/views/admin/AdminMcp.vue`
- `src/components/admin/McpServerDialog.vue`
- `src/components/admin/McpTestDialog.vue`
- `src/stores/mcp.ts`
- `src/api/mcp.ts`
- `src/types/mcp.ts`

## 使用示例

### 创建 Ollama 配置

```json
{
  "name": "ollama-llama3",
  "display_name": "Ollama Llama3",
  "description": "本地 Ollama 部署的 Llama3 模型",
  "provider": "ollama",
  "base_url": "http://localhost:11434/v1",
  "api_key": "EMPTY",
  "model_name": "llama3",
  "temperature": 0.7,
  "max_tokens": 4096,
  "role": "big",
  "activate": true
}
```

### 创建 VLLM 配置

```json
{
  "name": "vllm-qwen",
  "display_name": "VLLM Qwen2.5",
  "provider": "vllm",
  "base_url": "http://localhost:8000/v1",
  "api_key": "EMPTY",
  "model_name": "Qwen/Qwen2.5-72B-Instruct",
  "role": "flash",
  "activate": true
}
```

### 创建 OpenAI 配置

```json
{
  "name": "openai-gpt4",
  "display_name": "OpenAI GPT-4",
  "provider": "openai",
  "base_url": "https://api.openai.com/v1",
  "api_key": "sk-xxx",
  "model_name": "gpt-4-turbo",
  "role": "big",
  "activate": false
}
```

### 创建智谱 AI 配置

```json
{
  "name": "zhipu-glm4",
  "display_name": "智谱 GLM-4",
  "provider": "zhipuai",
  "base_url": "https://open.bigmodel.cn/api/paas/v4",
  "api_key": "xxx.xxx",
  "model_name": "glm-4",
  "role": "big",
  "activate": false
}
```
