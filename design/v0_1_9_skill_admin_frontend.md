# v0.1.9 Skill 管理前端对接方案

> 版本: v0.1.9
> 日期: 2026-02-18
> 后端方案: v0_1_9_skill_validation_v3

---

## 一、整体设计思路

### 1.1 路由与权限设计

```
/admin                    # 管理中心入口（需 is_admin = true）
  ├── /admin/skills       # Skill 管理
  ├── /admin/models       # 模型配置（预留）
  └── /admin/mcp          # MCP 配置（预留）
```

### 1.2 界面布局

采用 **左侧导航 + 右侧内容** 的管理后台布局，与主聊天界面分离。

---

## 二、新增文件结构

```
src/
├── api/
│   └── admin.ts                    # Admin API 封装
│
├── types/
│   └── admin.ts                    # Admin 相关类型定义
│
├── stores/
│   └── adminSkill.ts               # Skill 管理状态
│
├── views/
│   └── admin/
│       ├── AdminLayout.vue         # 管理后台布局
│       ├── AdminSkills.vue         # Skill 列表页
│       ├── SkillDetail.vue         # Skill 详情/验证报告
│       └── ImageVersions.vue       # 镜像版本管理
│
├── components/
│   └── admin/
│       ├── SkillUploadDialog.vue   # Skill 上传对话框
│       ├── SkillStatusChip.vue     # 状态标签
│       ├── ValidationReport.vue    # 验证报告渲染
│       ├── ScoreCard.vue           # 评分卡片
│       └── ImageVersionList.vue    # 镜像版本列表
│
└── router/
    └── index.ts                    # 新增 admin 路由
```

---

## 三、类型定义 (`src/types/admin.ts`)

```typescript
// Skill 状态
export type SkillStatus = 'pending' | 'validating' | 'approved' | 'rejected' | 'rollback_pending'
export type ValidationStage = 'layer1' | 'layer2' | 'completed' | 'failed' | null

// Skill 列表项
export interface SkillListItem {
  skill_id: string
  name: string
  display_name: string | null
  description: string | null
  status: SkillStatus
  validation_stage: ValidationStage
  validation_score: number | null
  layer1_passed: boolean | null
  layer2_passed: boolean | null
  runtime_image_version: string | null
  created_at: string
  validated_at: string | null
}

// Skill 详情
export interface SkillDetail extends SkillListItem {
  skill_path: string
  format_valid: boolean
  format_errors: string[]
  format_warnings: string[]
  
  blind_test_passed: boolean | null
  skill_triggered: boolean | null
  trigger_accuracy: number | null
  
  network_test_passed: boolean | null
  offline_capable: boolean | null
  blocked_network_calls: number | null
  
  execution_metrics: ExecutionMetrics | null
  task_results: TaskResult[] | null
  
  completion_score: number | null
  trigger_accuracy_score: number | null
  offline_capability_score: number | null
  resource_efficiency_score: number | null
  
  regression_results: Record<string, RegressionResult> | null
  installed_dependencies: Record<string, unknown> | null
  
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  reject_reason: string | null
}

export interface ExecutionMetrics {
  cpu_percent: number
  memory_mb: number
  disk_read_mb: number
  disk_write_mb: number
  execution_time_sec: number
}

export interface TaskResult {
  task: string
  completed: boolean
  skill_used: string | null
  correct_skill_used: boolean
  execution_time_ms: number
  output_summary?: string
}

export interface RegressionResult {
  passed: boolean
  score: number | null
  tasks_completed: number | null
  error: string | null
}

// 镜像版本
export interface ImageVersion {
  version: string
  skill_id: string | null
  skill_name: string | null
  created_at: string
  is_current: boolean
}

// API 响应
export interface SkillListResponse {
  skills: SkillListItem[]
  total: number
  page: number
  size: number
}

export interface UploadResponse {
  skill_id: string
  name: string
  status: SkillStatus
  format_valid: boolean
  format_errors: string[]
  message: string
}

export interface ApproveResponse {
  skill_id: string
  name: string
  status: SkillStatus
  runtime_image_version: string
  approved_at: string
  message: string
}

export interface RejectResponse {
  skill_id: string
  status: SkillStatus
  rejected_at: string
  reject_reason: string
}

export interface RollbackResponse {
  current_version: string
  target_version: string
  affected_skills: string[]
  message: string
}

export interface ImageVersionListResponse {
  versions: ImageVersion[]
  current_version: string
  total: number
}
```

---

## 四、API 封装 (`src/api/admin.ts`)

```typescript
import api from './client'
import type {
  SkillListResponse,
  SkillDetail,
  UploadResponse,
  ApproveResponse,
  RejectResponse,
  RollbackResponse,
  ImageVersionListResponse
} from '@/types/admin'

const BASE = '/api/admin'

export const adminApi = {
  // Skill 管理
  async uploadSkill(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<UploadResponse>(`${BASE}/skills/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async getSkills(params: {
    status?: string
    validation_stage?: string
    page?: number
    size?: number
  } = {}): Promise<SkillListResponse> {
    const response = await api.get<SkillListResponse>(`${BASE}/skills`, { params })
    return response.data
  },

  async getSkill(skillId: string): Promise<SkillDetail> {
    const response = await api.get<SkillDetail>(`${BASE}/skills/${skillId}`)
    return response.data
  },

  async getSkillReport(skillId: string): Promise<string> {
    const response = await api.get<string>(`${BASE}/skills/${skillId}/report`, {
      headers: { Accept: 'text/markdown' }
    })
    return response.data
  },

  async approveSkill(skillId: string): Promise<ApproveResponse> {
    const response = await api.post<ApproveResponse>(`${BASE}/skills/${skillId}/approve`)
    return response.data
  },

  async rejectSkill(skillId: string, reason: string): Promise<RejectResponse> {
    const response = await api.post<RejectResponse>(`${BASE}/skills/${skillId}/reject`, { reason })
    return response.data
  },

  async revalidateSkill(skillId: string): Promise<{ skill_id: string; status: string; validation_stage: string }> {
    const response = await api.post(`${BASE}/skills/${skillId}/revalidate`)
    return response.data
  },

  async deleteSkill(skillId: string): Promise<{ skill_id: string; status: string }> {
    const response = await api.delete(`${BASE}/skills/${skillId}`)
    return response.data
  },

  // 镜像版本管理
  async getImageVersions(): Promise<ImageVersionListResponse> {
    const response = await api.get<ImageVersionListResponse>(`${BASE}/images`)
    return response.data
  },

  async rollbackImage(targetVersion: string): Promise<RollbackResponse> {
    const response = await api.post<RollbackResponse>(`${BASE}/images/rollback`, {
      target_version: targetVersion
    })
    return response.data
  }
}
```

---

## 五、状态管理 (`src/stores/adminSkill.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SkillListItem, SkillDetail } from '@/types/admin'
import { adminApi } from '@/api/admin'

export const useAdminSkillStore = defineStore('adminSkill', () => {
  const skills = ref<SkillListItem[]>([])
  const currentSkill = ref<SkillDetail | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)

  const pendingCount = computed(() => 
    skills.value.filter(s => s.status === 'pending' && s.validation_stage === 'completed').length
  )

  async function fetchSkills(filters: { status?: string; validation_stage?: string } = {}) {
    isLoading.value = true
    error.value = null
    try {
      const response = await adminApi.getSkills({
        ...filters,
        page: page.value,
        size: size.value
      })
      skills.value = response.skills
      total.value = response.total
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch skills'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillDetail(skillId: string) {
    isLoading.value = true
    error.value = null
    try {
      currentSkill.value = await adminApi.getSkill(skillId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch skill detail'
    } finally {
      isLoading.value = false
    }
  }

  async function approveSkill(skillId: string) {
    const response = await adminApi.approveSkill(skillId)
    await fetchSkills()
    return response
  }

  async function rejectSkill(skillId: string, reason: string) {
    const response = await adminApi.rejectSkill(skillId, reason)
    await fetchSkills()
    return response
  }

  function clearCurrentSkill() {
    currentSkill.value = null
  }

  return {
    skills,
    currentSkill,
    isLoading,
    error,
    total,
    page,
    size,
    pendingCount,
    fetchSkills,
    fetchSkillDetail,
    approveSkill,
    rejectSkill,
    clearCurrentSkill
  }
})
```

---

## 六、路由配置

在 `src/router/index.ts` 中新增：

```typescript
{
  path: '/admin',
  component: () => import('@/views/admin/AdminLayout.vue'),
  meta: { requiresAuth: true, requiresAdmin: true },
  children: [
    {
      path: '',
      redirect: '/admin/skills'
    },
    {
      path: 'skills',
      name: 'AdminSkills',
      component: () => import('@/views/admin/AdminSkills.vue'),
      meta: { title: 'Skill 管理' }
    },
    {
      path: 'skills/:id',
      name: 'AdminSkillDetail',
      component: () => import('@/views/admin/SkillDetail.vue'),
      meta: { title: 'Skill 详情' }
    },
    {
      path: 'images',
      name: 'AdminImages',
      component: () => import('@/views/admin/ImageVersions.vue'),
      meta: { title: '镜像版本' }
    }
    // 预留其他配置模块
    // { path: 'models', name: 'AdminModels', component: ... },
    // { path: 'mcp', name: 'AdminMcp', component: ... },
  ]
}
```

路由守卫新增管理员权限检查。

---

## 七、UI 组件设计

### 7.1 AdminLayout.vue - 管理后台布局

左侧导航 + 右侧内容区域，包含：
- Skill 管理
- 镜像版本
- 模型配置（预留，禁用）
- MCP 配置（预留，禁用）

### 7.2 AdminSkills.vue - Skill 列表页

功能：
- 状态筛选（pending/validating/approved/rejected）
- 验证阶段筛选（layer1/layer2/completed/failed）
- 列表展示：名称、状态、评分、创建时间
- 点击行进入详情页
- 上传按钮打开上传对话框
- 待审核数量提示

### 7.3 SkillDetail.vue - 详情页

布局：
- 左侧 8 列：验证报告（Markdown 渲染）
- 右侧 4 列：评分卡片 + 审批操作 + 基本信息

审批操作：
- 拒绝（需输入原因）
- 批准入库

### 7.4 ImageVersions.vue - 镜像版本管理

功能：
- 版本列表（版本号、关联 Skill、创建时间、当前版本标记）
- 回滚操作（选择目标版本）
- 显示回滚影响的 Skill

---

## 八、关键子组件

### 8.1 SkillStatusChip.vue

状态颜色映射：
- validating: info (蓝)
- approved: success (绿)
- rejected: error (红)
- pending + completed: warning (橙)
- pending + failed: error (红)
- 其他: default (灰)

### 8.2 ScoreCard.vue

展示：
- 总分（圆形进度条）
- 四项评分：任务完成度、触发准确性、离线能力、资源效率

### 8.3 SkillUploadDialog.vue

功能：
- 文件选择（.zip）
- 上传进度
- 上传结果（成功/失败）

### 8.4 ValidationReport.vue

使用现有的 MarkdownRenderer 组件渲染验证报告。

---

## 九、与后端 API 对应关系

| 前端功能 | 后端接口 | 方法 |
|----------|----------|------|
| 上传 Skill | `/api/admin/skills/upload` | POST (multipart) |
| 获取 Skill 列表 | `/api/admin/skills` | GET |
| 获取 Skill 详情 | `/api/admin/skills/{skill_id}` | GET |
| 获取验证报告 | `/api/admin/skills/{skill_id}/report` | GET |
| 批准 Skill | `/api/admin/skills/{skill_id}/approve` | POST |
| 拒绝 Skill | `/api/admin/skills/{skill_id}/reject` | POST |
| 重新验证 | `/api/admin/skills/{skill_id}/revalidate` | POST |
| 删除 Skill | `/api/admin/skills/{skill_id}` | DELETE |
| 获取镜像版本 | `/api/admin/images` | GET |
| 回滚镜像 | `/api/admin/images/rollback` | POST |

---

## 十、实现计划

| 阶段 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| Phase 1 | 类型定义 | `src/types/admin.ts` | 0.5h |
| Phase 2 | API 封装 | `src/api/admin.ts` | 0.5h |
| Phase 3 | Store | `src/stores/adminSkill.ts` | 0.5h |
| Phase 4 | 路由配置 | `src/router/index.ts` | 0.5h |
| Phase 5 | 管理布局 | `src/views/admin/AdminLayout.vue` | 0.5h |
| Phase 6 | 列表页 | `src/views/admin/AdminSkills.vue` | 1.5h |
| Phase 7 | 详情页 | `src/views/admin/SkillDetail.vue` | 1.5h |
| Phase 8 | 子组件 | `src/components/admin/*.vue` | 1.5h |
| Phase 9 | 镜像管理 | `src/views/admin/ImageVersions.vue` | 1h |

**总计：约 8 小时**

---

## 十一、后续扩展

当前设计已预留扩展点：

1. **新增模型配置**：在 `AdminLayout.vue` 添加导航项，创建 `AdminModels.vue` 页面
2. **新增 MCP 配置**：同上模式
3. **API 层**：在 `admin.ts` 中新增对应接口
