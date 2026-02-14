# WebDAV 文件管理 - 前端改造方案

> 基于 v0.1.5 WebDAV 文件操作 API，采用侧边栏面板模式整合到现有聊天界面

## 一、架构设计

### 1.1 整体布局

```
┌─────────────────────────────────────────────────────────────────┐
│                            AppBar                                │
│  [≡] AI Assistant                      [🌙] [📁] [👤]          │
├────────────┬────────────────────────────────┬──────────────────┤
│  Session   │                                │    File Panel    │
│  Drawer    │       Chat Container           │     (可折叠)      │
│  (会话列表) │       (聊天内容)                │    (文件管理)    │
│            │                                │                  │
│            │                                │                  │
│            │                                │                  │
├────────────┴────────────────────────────────┴──────────────────┤
│                        ChatInput                                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 核心功能模块

| 模块 | 功能 |
|------|------|
| **FilePanel** | 侧边栏容器，支持展开/折叠 |
| **FileBreadcrumb** | 面包屑导航，显示当前路径 |
| **FileToolbar** | 工具栏（新建、上传、视图切换） |
| **FileList** | 文件列表（列表视图/网格视图） |
| **FileUploadZone** | 拖拽上传区域 |
| **UploadQueue** | 上传队列管理 |
| **FilePreview** | 文件预览（图片/文本/PDF） |
| **FileContextMenu** | 右键菜单操作 |

---

## 二、文件结构

```
src/
├── api/
│   ├── webdav.ts              # WebDAV 客户端封装
│   ├── chunkUpload.ts         # 分片上传 API
│   └── (现有...)
│
├── components/
│   ├── file/                  # 新增：文件管理组件
│   │   ├── FilePanel.vue           # 侧边栏面板容器
│   │   ├── FileList.vue            # 文件列表(支持列表/网格)
│   │   ├── FileBreadcrumb.vue      # 面包屑导航
│   │   ├── FileToolbar.vue         # 工具栏(新建/上传/视图切换)
│   │   ├── FileUploadZone.vue      # 拖拽上传区域
│   │   ├── UploadQueue.vue         # 上传队列
│   │   ├── UploadProgress.vue      # 上传进度条
│   │   ├── FilePreview.vue         # 文件预览(图片/文本/PDF)
│   │   ├── FileContextMenu.vue     # 右键菜单
│   │   ├── NewFolderDialog.vue     # 新建文件夹对话框
│   │   └── RenameDialog.vue        # 重命名对话框
│   │
│   ├── layout/
│   │   ├── MainLayout.vue     # 修改：增加FilePanel
│   │   ├── AppBar.vue         # 修改：增加文件面板切换按钮
│   │   └── (现有...)
│   └── (现有...)
│
├── composables/
│   ├── useWebDAV.ts           # WebDAV操作封装
│   ├── useFileUpload.ts       # 上传逻辑(含分片)
│   ├── useFilePreview.ts      # 预览逻辑
│   └── (现有...)
│
├── stores/
│   ├── file.ts                # 新增：文件状态管理
│   └── (现有...)
│
├── types/
│   ├── file.ts                # 新增：文件类型定义
│   └── (现有...)
│
└── (其他现有文件...)
```

---

## 三、类型定义

### 3.1 文件类型 (`src/types/file.ts`)

```typescript
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
}

export interface UploadProgress {
  uploaded: number
  total: number
  percent: number
  speed?: string
  remaining?: string
}

export interface FileStoreState {
  currentPath: string
  items: FileItem[]
  loading: boolean
  selectedItems: Set<string>
  uploadQueue: UploadTask[]
  panelOpen: boolean
  viewMode: 'list' | 'grid'
  previewFile: FileItem | null
}
```

### 3.2 WebDAV 响应解析

```typescript
interface WebDAVResource {
  filename: string
  basename: string
  lastmod: string
  size: number
  type: 'file' | 'directory'
  mime: string | null
  etag: string | null
}
```

---

## 四、API 层设计

### 4.1 WebDAV 客户端 (`src/api/webdav.ts`)

```typescript
import { createClient, WebDAVClient } from 'webdav'

let client: WebDAVClient | null = null

export function initWebDAVClient(token: string) {
  client = createClient('/dav', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return client
}

export function getWebDAVClient(): WebDAVClient {
  if (!client) {
    throw new Error('WebDAV client not initialized')
  }
  return client
}

export function resetWebDAVClient() {
  client = null
}
```

### 4.2 分片上传 (`src/api/chunkUpload.ts`)

```typescript
const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
const CHUNK_THRESHOLD = 100 * 1024 * 1024 // 100MB

export interface ChunkUploadOptions {
  token: string
  file: File
  targetPath: string
  onProgress?: (progress: UploadProgress) => void
}

export async function uploadLargeFile(options: ChunkUploadOptions): Promise<string>
export async function initUpload(token: string, params: InitUploadParams): Promise<InitUploadResponse>
export async function uploadChunk(token: string, params: UploadChunkParams): Promise<UploadChunkResponse>
export async function completeUpload(token: string, params: CompleteUploadParams): Promise<CompleteUploadResponse>
export async function cancelUpload(token: string, uploadId: string): Promise<void>
```

---

## 五、状态管理 (`src/stores/file.ts`)

```typescript
import { defineStore } from 'pinia'
import type { FileItem, UploadTask } from '@/types/file'

export const useFileStore = defineStore('file', () => {
  // State
  const currentPath = ref('/')
  const items = ref<FileItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedItems = ref<Set<string>>(new Set())
  const uploadQueue = ref<UploadTask[]>([])
  const panelOpen = ref(true)
  const viewMode = ref<'list' | 'grid'>('list')
  const previewFile = ref<FileItem | null>(null)

  // Getters
  const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => {
      // 目录优先
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  })

  const uploadingCount = computed(() => 
    uploadQueue.value.filter(t => t.status === 'uploading').length
  )

  // Actions
  async function loadDirectory(path: string) { /* ... */ }
  async function createDirectory(name: string) { /* ... */ }
  async function deleteItems(paths: string[]) { /* ... */ }
  async function renameItem(path: string, newName: string) { /* ... */ }
  async function moveItem(source: string, dest: string) { /* ... */ }
  function addToUploadQueue(file: File, targetPath: string) { /* ... */ }
  function processUploadQueue() { /* ... */ }
  function toggleSelection(path: string) { /* ... */ }
  function clearSelection() { /* ... */ }

  return {
    // State
    currentPath, items, loading, error, selectedItems,
    uploadQueue, panelOpen, viewMode, previewFile,
    // Getters
    sortedItems, uploadingCount,
    // Actions
    loadDirectory, createDirectory, deleteItems, renameItem, moveItem,
    addToUploadQueue, processUploadQueue, toggleSelection, clearSelection
  }
})
```

---

## 六、分片上传配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 分片阈值 | **100MB** | 超过此大小启用分片上传 |
| 分片大小 | 10MB | 每个分片的大小 |
| 并发数 | 1 | 串行上传，避免服务器压力 |
| 重试次数 | 3 | 单个分片失败重试次数 |
| 超时时间 | 30s | 单个请求超时 |

---

## 七、组件设计

### 7.1 FilePanel.vue（侧边栏容器）

```vue
<template>
  <div class="file-panel" :class="{ collapsed: !open }">
    <div class="panel-header">
      <span class="title">文件管理</span>
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:open', false)" />
    </div>
    
    <template v-if="open">
      <FileBreadcrumb :path="currentPath" @navigate="navigateTo" />
      <FileToolbar @upload="handleUpload" @new-folder="showNewFolder = true" />
      <FileUploadZone @files="handleFilesDrop">
        <FileList :items="sortedItems" :loading="loading" @item-click="handleItemClick" />
      </FileUploadZone>
      <UploadQueue v-if="uploadQueue.length" :tasks="uploadQueue" />
    </template>
  </div>
</template>
```

### 7.2 FileList.vue（文件列表）

功能：
- 支持列表视图 / 网格视图切换
- 单击进入目录 / 选中文件
- 双击预览文件
- 右键显示上下文菜单
- 多选支持（Ctrl+Click / Shift+Click）

### 7.3 FileUploadZone.vue（拖拽上传）

功能：
- 监听 dragenter/dragover/dragleave/drop 事件
- 拖拽时显示虚线边框提示
- 支持拖拽多个文件/文件夹
- 自动判断是否需要分片上传

### 7.4 FilePreview.vue（文件预览）

支持的文件类型：
| 类型 | 文件格式 | 预览方式 |
|------|----------|----------|
| 图片 | jpg/png/gif/webp/svg | 直接显示 |
| 文本 | txt/md/json/xml | 语法高亮 |
| 代码 | js/ts/py/go/java | 语法高亮 |
| PDF | pdf | iframe/embed |

---

## 八、MainLayout 改造

### 8.1 布局调整

```vue
<template>
  <v-layout class="rounded rounded-md main-layout">
    <SessionDrawer v-model="drawerOpen" />
    <AppBar 
      @toggle-drawer="drawerOpen = !drawerOpen" 
      @toggle-files="filePanelOpen = !filePanelOpen"
    />
    
    <v-main class="main-content">
      <div class="content-wrapper">
        <div class="chat-area" :class="{ 'panel-open': filePanelOpen }">
          <slot />
        </div>
        <FilePanel v-model:open="filePanelOpen" />
      </div>
    </v-main>
  </v-layout>
</template>

<style scoped>
.content-wrapper {
  display: flex;
  height: 100%;
}

.chat-area {
  flex: 1;
  min-width: 0;
  transition: all 0.3s ease;
}

.chat-area.panel-open {
  margin-right: 320px;
}

.file-panel {
  position: fixed;
  right: 0;
  top: 64px;
  bottom: 0;
  width: 320px;
  z-index: 10;
}
</style>
```

### 8.2 AppBar 增加文件按钮

```vue
<v-btn
  variant="text"
  :active="filePanelOpen"
  @click="$emit('toggle-files')"
>
  <v-icon>mdi-folder-outline</v-icon>
</v-btn>
```

---

## 九、用户体验亮点

| 功能 | 实现方式 | 价值 |
|------|----------|------|
| **拖拽上传** | 全局拖拽区域 | 无需点击，直接拖入 |
| **实时进度** | 进度条 + 速度 + 剩余时间 | 减少等待焦虑 |
| **智能分片** | >100MB自动分片 | 大文件稳定上传 |
| **断点续传** | 分片上传 + 状态缓存 | 网络中断可恢复 |
| **即时预览** | 点击即预览 | 无需下载查看 |
| **右键菜单** | ContextMenu | 快捷操作入口 |
| **批量操作** | 多选 + 批量删除/移动 | 提高效率 |
| **键盘快捷键** | Delete/F2/Ctrl+N | 高级用户友好 |
| **操作确认** | 删除前二次确认 | 防误操作 |
| **冲突检测** | ETag + 409处理 | 防覆盖他人修改 |

---

## 十、实现优先级

### Phase 1 - 基础功能 (P0)

| 任务 | 工时 | 依赖 |
|------|------|------|
| 1.1 类型定义 `types/file.ts` | 0.5h | - |
| 1.2 WebDAV API `api/webdav.ts` | 1.5h | - |
| 1.3 Store `stores/file.ts` | 1h | 1.1 |
| 1.4 useWebDAV composable | 1h | 1.2, 1.3 |
| 1.5 FileBreadcrumb | 1h | 1.3 |
| 1.6 FileList | 2h | 1.3 |
| 1.7 FileToolbar + FilePanel | 2h | 1.5, 1.6 |
| 1.8 MainLayout + AppBar 改造 | 1h | 1.7 |

**小计: 10h**

### Phase 2 - 上传功能 (P1)

| 任务 | 工时 | 依赖 |
|------|------|------|
| 2.1 FileUploadZone | 1.5h | 1.3 |
| 2.2 UploadProgress | 1h | - |
| 2.3 UploadQueue | 1h | 2.2 |
| 2.4 分片上传 `api/chunkUpload.ts` | 2h | - |
| 2.5 useFileUpload composable | 1.5h | 2.4 |
| 2.6 上传集成测试 | 1h | 2.1-2.5 |

**小计: 8h**

### Phase 3 - 增强功能 (P2)

| 任务 | 工时 | 依赖 |
|------|------|------|
| 3.1 FilePreview - 图片 | 1h | - |
| 3.2 FilePreview - 文本/代码 | 1h | - |
| 3.3 FileContextMenu | 1h | 1.6 |
| 3.4 RenameDialog | 0.5h | 3.3 |
| 3.5 批量操作 | 1h | 1.6 |
| 3.6 键盘快捷键 | 1h | - |

**小计: 5.5h**

### Phase 4 - 进阶功能 (P3)

| 任务 | 工时 | 依赖 |
|------|------|------|
| 4.1 断点续传 | 3h | 2.4 |
| 4.2 与聊天联动(@文件) | 3h | Phase 1-3 |
| 4.3 文件搜索 | 2h | - |

**小计: 8h**

---

**总工时: 31.5h**

---

## 十一、注意事项

1. **认证**: 所有请求必须携带 JWT Token，从 `sessionStorage` 获取
2. **路径隔离**: 用户只能访问自己的 workspace，尝试访问他人目录会返回 403
3. **ETag 冲突**: 使用 `If-Match` 头防止并发覆盖，409 错误需提示用户
4. **大文件**: 超过 100MB 必须使用分片上传
5. **临时文件**: 未完成的分片上传 24 小时后自动清理
6. **编码**: 文件名统一使用 UTF-8

---

## 十二、依赖安装

```bash
cd front
npm install webdav
```

---

## 十三、API 参考

详细 API 文档请参考: `backend/design/前端对接文档/v0_1_5_webdav文件操作-前端对接.md`
