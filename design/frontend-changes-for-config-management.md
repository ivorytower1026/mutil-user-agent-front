# 前端改动方案 - 配置管理功能

> 版本: v1.0  
> 日期: 2026-02-28  
> 依赖后端版本: v0.2.0

## 一、改动概述

根据后端新增的配置管理API，前端需要新增以下功能：

1. **MCP服务管理** - 添加/编辑/删除/测试MCP服务
2. **代理配置管理** - 配置主代理和子代理的prompt、工具、skills
3. **简化Skill上传** - 直接上传skill无需验证流程

---

## 二、新增文件清单

### 2.1 API模块

| 文件路径 | 说明 |
|----------|------|
| `src/api/mcp.ts` | MCP服务管理API |
| `src/api/agentConfig.ts` | 代理配置管理API |

### 2.2 类型定义

| 文件路径 | 说明 |
|----------|------|
| `src/types/mcp.ts` | MCP相关类型 |
| `src/types/agentConfig.ts` | 代理配置相关类型 |

### 2.3 视图组件

| 文件路径 | 说明 |
|----------|------|
| `src/views/admin/AdminMcp.vue` | MCP管理页面 |
| `src/views/admin/AdminAgents.vue` | 代理配置页面 |
| `src/views/admin/SimpleSkills.vue` | 简化Skill管理页面 |
| `src/components/admin/McpServerDialog.vue` | MCP服务编辑弹窗 |
| `src/components/admin/McpTestDialog.vue` | MCP连接测试弹窗 |
| `src/components/admin/SubagentDialog.vue` | 子代理编辑弹窗 |
| `src/components/admin/SimpleSkillUploadDialog.vue` | 简化Skill上传弹窗 |

### 2.4 Store

| 文件路径 | 说明 |
|----------|------|
| `src/stores/mcp.ts` | MCP状态管理 |
| `src/stores/agentConfig.ts` | 代理配置状态管理 |
| `src/stores/simpleSkill.ts` | 简化Skill状态管理 |

---

## 三、修改现有文件

### 3.1 `src/router/index.ts`

新增路由：

```typescript
// 在 /admin 的 children 中添加
{
  path: 'mcp',
  name: 'AdminMcp',
  component: () => import('@/views/admin/AdminMcp.vue'),
  meta: { title: 'MCP 配置' }
},
{
  path: 'agents',
  name: 'AdminAgents',
  component: () => import('@/views/admin/AdminAgents.vue'),
  meta: { title: '代理配置' }
},
{
  path: 'simple-skills',
  name: 'AdminSimpleSkills',
  component: () => import('@/views/admin/SimpleSkills.vue'),
  meta: { title: 'Skill 快速上传' }
}
```

### 3.2 `src/views/admin/AdminLayout.vue`

修改导航菜单，启用MCP配置，新增代理配置和快速上传：

```vue
<v-list nav>
  <v-list-item prepend-icon="mdi-arrow-left" title="返回主页" to="/" />
  <v-divider class="my-2" />
  <v-list-subheader>配置管理</v-list-subheader>
  <v-list-item
    to="/admin/skills"
    prepend-icon="mdi-puzzle"
    title="Skill 管理"
    value="skills"
  />
  <v-list-item
    to="/admin/simple-skills"
    prepend-icon="mdi-upload"
    title="Skill 快速上传"
    value="simple-skills"
  />
  <v-list-item
    to="/admin/mcp"
    prepend-icon="mdi-connection"
    title="MCP 配置"
    value="mcp"
  />
  <v-list-item
    to="/admin/agents"
    prepend-icon="mdi-robot"
    title="代理配置"
    value="agents"
  />
</v-list>
```

### 3.3 `src/types/index.ts`

添加新类型导出：

```typescript
export * from './mcp'
export * from './agentConfig'
```

---

## 四、详细实现方案

### 4.1 MCP服务管理

#### 4.1.1 类型定义 (`src/types/mcp.ts`)

```typescript
export type McpTransport = 'stdio' | 'http' | 'sse'

export interface McpServer {
  id: string
  name: string
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface McpServerCreate {
  name: string
  transport: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled?: boolean
}

export interface McpServerUpdate {
  transport?: McpTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  headers?: Record<string, string>
  enabled?: boolean
}

export interface McpTool {
  name: string
  description: string
}

export interface McpTestResult {
  success: boolean
  tools_count?: number
  tools?: McpTool[]
  error?: string
}

export interface McpServerListResponse {
  servers: McpServer[]
  total: number
}
```

#### 4.1.2 API模块 (`src/api/mcp.ts`)

```typescript
import api from './client'
import type { 
  McpServer, 
  McpServerCreate, 
  McpServerUpdate,
  McpServerListResponse,
  McpTestResult,
  McpTool 
} from '@/types/mcp'

const BASE = '/api/admin/mcp'

export const mcpApi = {
  async list(): Promise<McpServerListResponse> {
    const response = await api.get<McpServerListResponse>(BASE)
    return response.data
  },

  async get(name: string): Promise<McpServer> {
    const response = await api.get<McpServer>(`${BASE}/${name}`)
    return response.data
  },

  async create(data: McpServerCreate): Promise<McpServer> {
    const response = await api.post<McpServer>(BASE, data)
    return response.data
  },

  async update(name: string, data: McpServerUpdate): Promise<McpServer> {
    const response = await api.put<McpServer>(`${BASE}/${name}`, data)
    return response.data
  },

  async delete(name: string): Promise<void> {
    await api.delete(`${BASE}/${name}`)
  },

  async test(name: string): Promise<McpTestResult> {
    const response = await api.post<McpTestResult>(`${BASE}/${name}/test`)
    return response.data
  },

  async listTools(name: string): Promise<McpTool[]> {
    const response = await api.get<McpTool[]>(`${BASE}/${name}/tools`)
    return response.data
  },

  async reload(): Promise<void> {
    await api.post(`${BASE}/reload`)
  }
}
```

#### 4.1.3 Store (`src/stores/mcp.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mcpApi } from '@/api/mcp'
import type { McpServer, McpServerCreate, McpServerUpdate, McpTestResult, McpTool } from '@/types/mcp'

export const useMcpStore = defineStore('mcp', () => {
  const servers = ref<McpServer[]>([])
  const isLoading = ref(false)
  const total = ref(0)

  async function fetchServers() {
    isLoading.value = true
    try {
      const response = await mcpApi.list()
      servers.value = response.servers
      total.value = response.total
    } finally {
      isLoading.value = false
    }
  }

  async function createServer(data: McpServerCreate) {
    const server = await mcpApi.create(data)
    await fetchServers()
    return server
  }

  async function updateServer(name: string, data: McpServerUpdate) {
    const server = await mcpApi.update(name, data)
    await fetchServers()
    return server
  }

  async function deleteServer(name: string) {
    await mcpApi.delete(name)
    await fetchServers()
  }

  async function testConnection(name: string): Promise<McpTestResult> {
    return await mcpApi.test(name)
  }

  async function listTools(name: string): Promise<McpTool[]> {
    return await mcpApi.listTools(name)
  }

  async function reload() {
    await mcpApi.reload()
    await fetchServers()
  }

  return {
    servers,
    isLoading,
    total,
    fetchServers,
    createServer,
    updateServer,
    deleteServer,
    testConnection,
    listTools,
    reload
  }
})
```

#### 4.1.4 视图页面 (`src/views/admin/AdminMcp.vue`)

```vue
<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">MCP 配置管理</h1>
      <div class="d-flex ga-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-refresh"
          :loading="store.isLoading"
          @click="store.reload"
        >
          重新加载
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          添加 MCP 服务
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-data-table
          :items="store.servers"
          :loading="store.isLoading"
          :headers="headers"
          hover
        >
          <template #item.name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.transport }}</div>
            </div>
          </template>
          <template #item.transport="{ item }">
            <v-chip size="small" :color="getTransportColor(item.transport)">
              {{ item.transport }}
            </v-chip>
          </template>
          <template #item.enabled="{ item }">
            <v-switch
              v-model="item.enabled"
              color="success"
              hide-details
              @update:model-value="toggleEnabled(item)"
            />
          </template>
          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="testServer(item)">
              测试
            </v-btn>
            <v-btn size="small" variant="text" @click="editServer(item)">
              编辑
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="confirmDelete(item)">
              删除
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <McpServerDialog
      v-model="showDialog"
      :server="editingServer"
      @saved="onSaved"
    />

    <McpTestDialog
      v-model="showTestDialog"
      :server-name="testingServer"
    />

    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          确定要删除 MCP 服务 "{{ deletingServer?.name }}" 吗？
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteConfirm = false">取消</v-btn>
          <v-btn color="error" @click="doDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMcpStore } from '@/stores/mcp'
import { useNotification } from '@/stores/notification'
import McpServerDialog from '@/components/admin/McpServerDialog.vue'
import McpTestDialog from '@/components/admin/McpTestDialog.vue'
import type { McpServer } from '@/types/mcp'

const store = useMcpStore()
const notification = useNotification()

const showDialog = ref(false)
const showTestDialog = ref(false)
const showDeleteConfirm = ref(false)
const editingServer = ref<McpServer | null>(null)
const testingServer = ref('')
const deletingServer = ref<McpServer | null>(null)

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: '传输方式', key: 'transport', sortable: false, width: 120 },
  { title: '状态', key: 'enabled', sortable: false, width: 100 },
  { title: '操作', key: 'actions', sortable: false, width: 200 }
]

function getTransportColor(transport: string): string {
  switch (transport) {
    case 'stdio': return 'primary'
    case 'http': return 'success'
    case 'sse': return 'info'
    default: return 'default'
  }
}

function openCreateDialog() {
  editingServer.value = null
  showDialog.value = true
}

function editServer(server: McpServer) {
  editingServer.value = server
  showDialog.value = true
}

function testServer(server: McpServer) {
  testingServer.value = server.name
  showTestDialog.value = true
}

function confirmDelete(server: McpServer) {
  deletingServer.value = server
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingServer.value) return
  try {
    await store.deleteServer(deletingServer.value.name)
    notification.success(`MCP 服务 "${deletingServer.value.name}" 已删除`)
    showDeleteConfirm.value = false
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '删除失败')
  }
}

async function toggleEnabled(server: McpServer) {
  try {
    await store.updateServer(server.name, { enabled: server.enabled })
    notification.success(`MCP 服务 "${server.name}" 已${server.enabled ? '启用' : '禁用'}`)
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '更新失败')
    server.enabled = !server.enabled
  }
}

function onSaved() {
  showDialog.value = false
  store.fetchServers()
}

onMounted(() => {
  store.fetchServers()
})
</script>
```

#### 4.1.5 编辑弹窗 (`src/components/admin/McpServerDialog.vue`)

```vue
<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ isEdit ? '编辑 MCP 服务' : '添加 MCP 服务' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="form.name"
            label="服务名称"
            :rules="[rules.required, rules.nameFormat]"
            :disabled="isEdit"
            class="mb-3"
          />

          <v-select
            v-model="form.transport"
            :items="transportOptions"
            label="传输方式"
            :rules="[rules.required]"
            class="mb-3"
          />

          <!-- stdio 配置 -->
          <template v-if="form.transport === 'stdio'">
            <v-text-field
              v-model="form.command"
              label="命令"
              :rules="[rules.requiredCommand]"
              class="mb-3"
            />
            <v-textarea
              v-model="argsText"
              label="参数（每行一个）"
              rows="3"
              class="mb-3"
            />
            <v-textarea
              v-model="envText"
              label="环境变量（KEY=VALUE 格式，每行一个）"
              rows="3"
            />
          </template>

          <!-- http/sse 配置 -->
          <template v-if="form.transport === 'http' || form.transport === 'sse'">
            <v-text-field
              v-model="form.url"
              label="URL"
              :rules="[rules.requiredUrl]"
              class="mb-3"
            />
            <v-textarea
              v-model="headersText"
              label="请求头（KEY: VALUE 格式，每行一个）"
              rows="3"
            />
          </template>

          <v-switch
            v-model="form.enabled"
            label="启用"
            color="success"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">取消</v-btn>
        <v-btn color="primary" :disabled="!isValid" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMcpStore } from '@/stores/mcp'
import type { McpServer, McpServerCreate } from '@/types/mcp'

const props = defineProps<{
  modelValue: boolean
  server: McpServer | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const store = useMcpStore()
const formRef = ref()
const isValid = ref(false)

const isEdit = computed(() => !!props.server)

const form = ref<McpServerCreate>({
  name: '',
  transport: 'stdio',
  command: '',
  args: [],
  url: '',
  env: {},
  headers: {},
  enabled: true
})

const argsText = ref('')
const envText = ref('')
const headersText = ref('')

const transportOptions = [
  { title: 'STDIO', value: 'stdio' },
  { title: 'HTTP', value: 'http' },
  { title: 'SSE', value: 'sse' }
]

const rules = {
  required: (v: string) => !!v || '必填',
  nameFormat: (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) || '只能包含字母、数字、连字符和下划线',
  requiredCommand: () => form.value.transport !== 'stdio' || !!form.value.command || '必填',
  requiredUrl: () => (form.value.transport !== 'http' && form.value.transport !== 'sse') || !!form.value.url || '必填'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.server) {
      form.value = {
        name: props.server.name,
        transport: props.server.transport,
        command: props.server.command || '',
        args: props.server.args || [],
        url: props.server.url || '',
        env: props.server.env || {},
        headers: props.server.headers || {},
        enabled: props.server.enabled
      }
      argsText.value = (props.server.args || []).join('\n')
      envText.value = Object.entries(props.server.env || {}).map(([k, v]) => `${k}=${v}`).join('\n')
      headersText.value = Object.entries(props.server.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  form.value = {
    name: '',
    transport: 'stdio',
    command: '',
    args: [],
    url: '',
    env: {},
    headers: {},
    enabled: true
  }
  argsText.value = ''
  envText.value = ''
  headersText.value = ''
}

async function handleSave() {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  // 解析文本字段
  form.value.args = argsText.value.split('\n').filter(Boolean)
  form.value.env = parseKeyValue(envText.value, '=')
  form.value.headers = parseKeyValue(headersText.value, ': ')

  try {
    if (isEdit.value) {
      await store.updateServer(props.server!.name, form.value)
    } else {
      await store.createServer(form.value)
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    throw e
  }
}

function parseKeyValue(text: string, separator: string): Record<string, string> {
  const result: Record<string, string> = {}
  text.split('\n').filter(Boolean).forEach(line => {
    const idx = line.indexOf(separator)
    if (idx > 0) {
      result[line.slice(0, idx).trim()] = line.slice(idx + separator.length).trim()
    }
  })
  return result
}
</script>
```

### 4.2 代理配置管理

#### 4.2.1 类型定义 (`src/types/agentConfig.ts`)

```typescript
export interface AgentConfig {
  id: string
  name: string
  is_main: boolean
  description?: string
  system_prompt?: string
  mcp_tools: string[]
  skills: string[]
  subagents: string[]
  model?: string
}

export interface MainAgentConfigUpdate {
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  subagents?: string[]
}

export interface SubagentCreate {
  name: string
  description?: string
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  model?: string
}

export interface SubagentUpdate {
  description?: string
  system_prompt?: string
  mcp_tools?: string[]
  skills?: string[]
  model?: string
}

export interface AllConfigsResponse {
  main: AgentConfig
  subagents: AgentConfig[]
}
```

#### 4.2.2 API模块 (`src/api/agentConfig.ts`)

```typescript
import api from './client'
import type { 
  AgentConfig, 
  AllConfigsResponse,
  MainAgentConfigUpdate,
  SubagentCreate,
  SubagentUpdate 
} from '@/types/agentConfig'

const BASE = '/api/admin/agents'

export const agentConfigApi = {
  async getAll(): Promise<AllConfigsResponse> {
    const response = await api.get<AllConfigsResponse>(BASE)
    return response.data
  },

  async updateMain(data: MainAgentConfigUpdate): Promise<AgentConfig> {
    const response = await api.put<AgentConfig>(`${BASE}/main`, data)
    return response.data
  },

  async createSubagent(data: SubagentCreate): Promise<AgentConfig> {
    const response = await api.post<AgentConfig>(`${BASE}/subagents`, data)
    return response.data
  },

  async getSubagent(name: string): Promise<AgentConfig> {
    const response = await api.get<AgentConfig>(`${BASE}/subagents/${name}`)
    return response.data
  },

  async updateSubagent(name: string, data: SubagentUpdate): Promise<AgentConfig> {
    const response = await api.put<AgentConfig>(`${BASE}/subagents/${name}`, data)
    return response.data
  },

  async deleteSubagent(name: string): Promise<void> {
    await api.delete(`${BASE}/subagents/${name}`)
  },

  async reload(): Promise<void> {
    await api.post(`${BASE}/reload`)
  }
}
```

#### 4.2.3 Store (`src/stores/agentConfig.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { agentConfigApi } from '@/api/agentConfig'
import type { AgentConfig, MainAgentConfigUpdate, SubagentCreate, SubagentUpdate } from '@/types/agentConfig'

export const useAgentConfigStore = defineStore('agentConfig', () => {
  const mainConfig = ref<AgentConfig | null>(null)
  const subagents = ref<AgentConfig[]>([])
  const isLoading = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      const response = await agentConfigApi.getAll()
      mainConfig.value = response.main
      subagents.value = response.subagents
    } finally {
      isLoading.value = false
    }
  }

  async function updateMain(data: MainAgentConfigUpdate) {
    const config = await agentConfigApi.updateMain(data)
    mainConfig.value = config
    return config
  }

  async function createSubagent(data: SubagentCreate) {
    const config = await agentConfigApi.createSubagent(data)
    await fetchAll()
    return config
  }

  async function updateSubagent(name: string, data: SubagentUpdate) {
    const config = await agentConfigApi.updateSubagent(name, data)
    await fetchAll()
    return config
  }

  async function deleteSubagent(name: string) {
    await agentConfigApi.deleteSubagent(name)
    await fetchAll()
  }

  async function reload() {
    await agentConfigApi.reload()
    await fetchAll()
  }

  return {
    mainConfig,
    subagents,
    isLoading,
    fetchAll,
    updateMain,
    createSubagent,
    updateSubagent,
    deleteSubagent,
    reload
  }
})
```

#### 4.2.4 视图页面 (`src/views/admin/AdminAgents.vue`)

```vue
<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">代理配置</h1>
      <v-btn
        color="secondary"
        prepend-icon="mdi-refresh"
        :loading="store.isLoading"
        @click="store.reload"
      >
        重新加载
      </v-btn>
    </div>

    <!-- 主代理配置 -->
    <v-card class="mb-4">
      <v-card-title>主代理配置</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="mainForm.system_prompt"
          label="System Prompt"
          rows="6"
          auto-grow
          class="mb-4"
        />

        <v-row>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="mainForm.mcp_tools"
              :items="availableMcpTools"
              label="MCP 工具"
              multiple
              chips
              closable-chips
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="mainForm.skills"
              :items="availableSkills"
              label="Skills"
              multiple
              chips
              closable-chips
            />
          </v-col>
        </v-row>

        <v-combobox
          v-model="mainForm.subagents"
          :items="subagentNames"
          label="启用的子代理"
          multiple
          chips
          closable-chips
          class="mt-4"
        />

        <div class="d-flex justify-end mt-4">
          <v-btn color="primary" :loading="savingMain" @click="saveMainConfig">
            保存主代理配置
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 子代理列表 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>子代理</span>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateSubagent">
          创建子代理
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :items="store.subagents"
          :headers="subagentHeaders"
          hover
        >
          <template #item.name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.description || '无描述' }}</div>
            </div>
          </template>
          <template #item.mcp_tools="{ item }">
            <v-chip v-for="tool in item.mcp_tools.slice(0, 3)" :key="tool" size="x-small" class="mr-1">
              {{ tool }}
            </v-chip>
            <span v-if="item.mcp_tools.length > 3" class="text-caption">
              +{{ item.mcp_tools.length - 3 }}
            </span>
          </template>
          <template #item.skills="{ item }">
            {{ item.skills.length }}
          </template>
          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="editSubagent(item)">
              编辑
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="confirmDeleteSubagent(item)">
              删除
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <SubagentDialog
      v-model="showSubagentDialog"
      :subagent="editingSubagent"
      :available-mcp-tools="availableMcpTools"
      :available-skills="availableSkills"
      @saved="onSubagentSaved"
    />

    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          确定要删除子代理 "{{ deletingSubagent?.name }}" 吗？
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteConfirm = false">取消</v-btn>
          <v-btn color="error" @click="doDeleteSubagent">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAgentConfigStore } from '@/stores/agentConfig'
import { useNotification } from '@/stores/notification'
import SubagentDialog from '@/components/admin/SubagentDialog.vue'
import type { AgentConfig } from '@/types/agentConfig'

const store = useAgentConfigStore()
const notification = useNotification()

const savingMain = ref(false)
const showSubagentDialog = ref(false)
const showDeleteConfirm = ref(false)
const editingSubagent = ref<AgentConfig | null>(null)
const deletingSubagent = ref<AgentConfig | null>(null)

const mainForm = ref({
  system_prompt: '',
  mcp_tools: [] as string[],
  skills: [] as string[],
  subagents: [] as string[]
})

const subagentHeaders = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'MCP 工具', key: 'mcp_tools', sortable: false },
  { title: 'Skills 数', key: 'skills', sortable: false, width: 100 },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
]

const availableMcpTools = ref<string[]>([])
const availableSkills = ref<string[]>([])

const subagentNames = computed(() => store.subagents.map(s => s.name))

async function saveMainConfig() {
  savingMain.value = true
  try {
    await store.updateMain(mainForm.value)
    notification.success('主代理配置已保存')
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    savingMain.value = false
  }
}

function openCreateSubagent() {
  editingSubagent.value = null
  showSubagentDialog.value = true
}

function editSubagent(subagent: AgentConfig) {
  editingSubagent.value = subagent
  showSubagentDialog.value = true
}

function confirmDeleteSubagent(subagent: AgentConfig) {
  deletingSubagent.value = subagent
  showDeleteConfirm.value = true
}

async function doDeleteSubagent() {
  if (!deletingSubagent.value) return
  try {
    await store.deleteSubagent(deletingSubagent.value.name)
    notification.success(`子代理 "${deletingSubagent.value.name}" 已删除`)
    showDeleteConfirm.value = false
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '删除失败')
  }
}

function onSubagentSaved() {
  showSubagentDialog.value = false
  store.fetchAll()
}

onMounted(async () => {
  await store.fetchAll()
  if (store.mainConfig) {
    mainForm.value = {
      system_prompt: store.mainConfig.system_prompt || '',
      mcp_tools: [...(store.mainConfig.mcp_tools || [])],
      skills: [...(store.mainConfig.skills || [])],
      subagents: [...(store.mainConfig.subagents || [])]
    }
  }
})
</script>
```

### 4.3 简化Skill上传

#### 4.3.1 修改 `src/api/admin.ts`

添加简化Skill API：

```typescript
import type { SimpleSkillItem, SimpleSkillListResponse, SimpleSkillResponse } from '@/types/admin'

// 在 adminApi 对象中添加：

async uploadSkillSimple(file: File): Promise<SimpleSkillResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<SimpleSkillResponse>(`${BASE}/skills/simple/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
},

async getSimpleSkills(status?: string): Promise<SimpleSkillListResponse> {
  const response = await api.get<SimpleSkillListResponse>(`${BASE}/skills/simple`, { 
    params: { status } 
  })
  return response.data
},

async deleteSimpleSkill(name: string): Promise<void> {
  await api.delete(`${BASE}/skills/simple/${name}`)
},

async enableSimpleSkill(skillId: string): Promise<{ skill_id: string; status: string }> {
  const response = await api.post(`${BASE}/skills/simple/${skillId}/enable`)
  return response.data
},

async disableSimpleSkill(skillId: string): Promise<{ skill_id: string; status: string }> {
  const response = await api.post(`${BASE}/skills/simple/${skillId}/disable`)
  return response.data
},

async syncSimpleSkills(): Promise<{ synced: number; message: string }> {
  const response = await api.post(`${BASE}/skills/simple/sync`)
  return response.data
}
```

#### 4.3.2 添加类型到 `src/types/admin.ts`

```typescript
// 简化Skill类型
export type SimpleSkillStatus = 'active' | 'disabled'

export interface SimpleSkillItem {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SimpleSkillStatus
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  created_at: string
}

export interface SimpleSkillListResponse {
  skills: SimpleSkillItem[]
  total: number
}

export interface SimpleSkillResponse {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SimpleSkillStatus
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  created_at: string
}
```

#### 4.3.3 视图页面 (`src/views/admin/SimpleSkills.vue`)

```vue
<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h1 class="text-h5">Skill 快速上传</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          上传的Skill直接生效，无需验证流程
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-sync"
          :loading="syncing"
          @click="syncSkills"
        >
          同步目录
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-upload" @click="showUpload = true">
          上传 Skill
        </v-btn>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterStatus"
              :items="statusOptions"
              label="状态"
              clearable
              density="compact"
              @update:model-value="loadSkills"
            />
          </v-col>
        </v-row>

        <v-data-table
          :items="skills"
          :loading="loading"
          :headers="headers"
          hover
        >
          <template #item.name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.display_name || item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.name }}</div>
            </div>
          </template>
          <template #item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'default'" size="small">
              {{ item.status === 'active' ? '启用' : '禁用' }}
            </v-chip>
          </template>
          <template #item.format_valid="{ item }">
            <v-icon :color="item.format_valid ? 'success' : 'error'">
              {{ item.format_valid ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
          </template>
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status === 'active'"
              size="small"
              variant="text"
              @click="disableSkill(item)"
            >
              禁用
            </v-btn>
            <v-btn
              v-else
              size="small"
              variant="text"
              @click="enableSkill(item)"
            >
              启用
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="confirmDelete(item)">
              删除
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <SimpleSkillUploadDialog v-model="showUpload" @uploaded="onUploaded" />

    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          确定要删除 Skill "{{ deletingSkill?.name }}" 吗？<br>
          这将同时删除磁盘上的文件。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteConfirm = false">取消</v-btn>
          <v-btn color="error" @click="doDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useNotification } from '@/stores/notification'
import SimpleSkillUploadDialog from '@/components/admin/SimpleSkillUploadDialog.vue'
import type { SimpleSkillItem } from '@/types/admin'

const notification = useNotification()

const skills = ref<SimpleSkillItem[]>([])
const loading = ref(false)
const syncing = ref(false)
const showUpload = ref(false)
const showDeleteConfirm = ref(false)
const deletingSkill = ref<SimpleSkillItem | null>(null)
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { title: '启用', value: 'active' },
  { title: '禁用', value: 'disabled' }
]

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: '状态', key: 'status', sortable: false, width: 100 },
  { title: '格式', key: 'format_valid', sortable: false, width: 80 },
  { title: '创建时间', key: 'created_at', sortable: false, width: 180 },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
]

async function loadSkills() {
  loading.value = true
  try {
    const response = await adminApi.getSimpleSkills(filterStatus.value ?? undefined)
    skills.value = response.skills
  } finally {
    loading.value = false
  }
}

async function syncSkills() {
  syncing.value = true
  try {
    const result = await adminApi.syncSimpleSkills()
    notification.success(result.message)
    await loadSkills()
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '同步失败')
  } finally {
    syncing.value = false
  }
}

async function enableSkill(skill: SimpleSkillItem) {
  try {
    await adminApi.enableSimpleSkill(skill.skill_id)
    skill.status = 'active'
    notification.success(`Skill "${skill.name}" 已启用`)
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '启用失败')
  }
}

async function disableSkill(skill: SimpleSkillItem) {
  try {
    await adminApi.disableSimpleSkill(skill.skill_id)
    skill.status = 'disabled'
    notification.success(`Skill "${skill.name}" 已禁用`)
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '禁用失败')
  }
}

function confirmDelete(skill: SimpleSkillItem) {
  deletingSkill.value = skill
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingSkill.value) return
  try {
    await adminApi.deleteSimpleSkill(deletingSkill.value.name)
    notification.success(`Skill "${deletingSkill.value.name}" 已删除`)
    showDeleteConfirm.value = false
    await loadSkills()
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '删除失败')
  }
}

function onUploaded() {
  showUpload.value = false
  loadSkills()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadSkills()
})
</script>
```

---

## 五、UI设计建议

### 5.1 MCP管理页面

```
┌─────────────────────────────────────────────────────────────┐
│ MCP 配置管理                              [+ 添加 MCP 服务] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 名称          传输方式  状态    操作                     │ │
│ │ playwright    stdio    ✓ 启用   [测试][编辑][删除]      │ │
│ │ weather-api   http     ✓ 启用   [测试][编辑][删除]      │ │
│ │ filesystem    stdio    ✗ 禁用   [测试][编辑][删除]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 代理配置页面

```
┌─────────────────────────────────────────────────────────────┐
│ 代理配置                                                    │
├─────────────────────────────────────────────────────────────┤
│ 主代理配置                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ System Prompt:                                          │ │
│ │ [多行文本编辑器]                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ MCP 工具: [x] playwright.* [x] weather.* [ ] filesystem.*  │
│ Skills:  [x] code-review [x] test-generator [ ] scraper    │
│ 子代理:  [x] researcher [x] code-writer                    │
│                                             [保存配置]      │
├─────────────────────────────────────────────────────────────┤
│ 子代理列表                              [+ 创建子代理]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 名称          描述              工具数  Skills  操作    │ │
│ │ researcher    信息检索代理      2       1       [编辑][删除]│
│ │ code-writer   代码编写代理      1       2       [编辑][删除]│
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 简化Skill上传页面

```
┌─────────────────────────────────────────────────────────────┐
│ Skill 快速上传（无需验证）               [同步目录] [上传]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 名称          描述              状态      操作          │ │
│ │ code-review   代码审查         ✓ 启用    [禁用][删除]   │ │
│ │ test-gen      测试生成         ✓ 启用    [禁用][删除]   │ │
│ │ web-scraper   网页抓取         ✗ 禁用    [启用][删除]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 说明：此模式上传的Skill直接生效，无需验证流程              │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、实施顺序

### Phase 1: 基础设施
- [ ] 添加类型定义 (`types/mcp.ts`, `types/agentConfig.ts`)
- [ ] 添加API模块 (`api/mcp.ts`, `api/agentConfig.ts`)
- [ ] 修改 `types/admin.ts` 添加简化Skill类型
- [ ] 修改 `api/admin.ts` 添加简化Skill API
- [ ] 修改 `types/index.ts` 导出新类型

### Phase 2: MCP管理
- [ ] 创建 `stores/mcp.ts`
- [ ] 创建 `views/admin/AdminMcp.vue`
- [ ] 创建 `components/admin/McpServerDialog.vue`
- [ ] 创建 `components/admin/McpTestDialog.vue`

### Phase 3: 代理配置
- [ ] 创建 `stores/agentConfig.ts`
- [ ] 创建 `views/admin/AdminAgents.vue`
- [ ] 创建 `components/admin/SubagentDialog.vue`

### Phase 4: 简化Skill
- [ ] 创建 `views/admin/SimpleSkills.vue`
- [ ] 创建 `components/admin/SimpleSkillUploadDialog.vue`

### Phase 5: 路由和导航
- [ ] 修改 `router/index.ts` 添加新路由
- [ ] 修改 `AdminLayout.vue` 更新导航菜单

---

## 七、注意事项

1. **权限控制**：所有新增的管理页面都需要 `requiresAdmin: true` 元数据

2. **错误处理**：统一使用现有的 `useNotification` store 处理成功/错误提示

3. **表单验证**：
   - MCP服务：stdio模式必须填写command，http/sse模式必须填写url
   - 子代理：name必须唯一，只能包含字母、数字、连字符和下划线

4. **状态刷新**：配置更新后需要调用reload接口让后端重新加载配置

5. **兼容性**：保留原有的Skill管理页面（带验证流程），新增的"快速上传"作为独立页面

6. **可用数据获取**：
   - MCP工具列表：从 `mcpApi.list()` 获取所有服务器，再调用 `mcpApi.listTools(name)` 获取工具
   - Skills列表：从 `adminApi.getSimpleSkills()` 获取
