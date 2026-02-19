<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">Skill 管理</h1>
      <v-btn color="primary" prepend-icon="mdi-upload" @click="showUpload = true">
        上传 Skill
      </v-btn>
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
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterStage"
              :items="stageOptions"
              label="验证阶段"
              clearable
              density="compact"
              @update:model-value="loadSkills"
            />
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center justify-end">
            <v-chip v-if="store.pendingCount > 0" color="warning" variant="flat">
              {{ store.pendingCount }} 个待审核
            </v-chip>
          </v-col>
        </v-row>

        <v-data-table-server
          :items="store.skills"
          :loading="store.isLoading"
          :items-length="store.total"
          :items-per-page="store.size"
          :headers="headers"
          item-value="skill_id"
          @update:options="handleOptionsUpdate"
          @click:row="goToDetail"
          hover
        >
          <template #item.name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.display_name || item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.name }}</div>
            </div>
          </template>
          <template #item.status="{ item }">
            <SkillStatusChip :status="item.status" :stage="item.validation_stage" />
          </template>
          <template #item.validation_score="{ item }">
            <v-chip
              v-if="item.validation_score != null"
              :color="getScoreColor(item.validation_score)"
              size="small"
            >
              {{ item.validation_score.toFixed(1) }}
            </v-chip>
            <span v-else class="text-medium-emphasis">-</span>
          </template>
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template #item.actions="{ item }">
            <v-btn
              v-if="canApprove(item)"
              size="small"
              color="success"
              variant="flat"
              @click.stop="handleApprove(item)"
            >
              批准
            </v-btn>
            <v-btn
              v-if="canRevalidate(item)"
              size="small"
              color="info"
              variant="text"
              @click.stop="handleRevalidate(item)"
            >
              重新验证
            </v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <SkillUploadDialog v-model="showUpload" @uploaded="onUploaded" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminSkillStore } from '@/stores/adminSkill'
import { useNotification } from '@/stores/notification'
import SkillStatusChip from '@/components/admin/SkillStatusChip.vue'
import SkillUploadDialog from '@/components/admin/SkillUploadDialog.vue'
import type { SkillListItem } from '@/types/admin'

const router = useRouter()
const route = useRoute()
const store = useAdminSkillStore()
const notification = useNotification()

const showUpload = ref(false)
const filterStatus = ref<string | null>(null)
const filterStage = ref<string | null>(null)

const statusOptions = [
  { title: '待审核', value: 'pending' },
  { title: '验证中', value: 'validating' },
  { title: '已批准', value: 'approved' },
  { title: '已拒绝', value: 'rejected' }
]

const stageOptions = [
  { title: '第一层验证', value: 'layer1' },
  { title: '第二层验证', value: 'layer2' },
  { title: '验证完成', value: 'completed' },
  { title: '验证失败', value: 'failed' }
]

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: '状态', key: 'status', sortable: false, width: 120 },
  { title: '评分', key: 'validation_score', sortable: false, width: 100 },
  { title: '创建时间', key: 'created_at', sortable: false, width: 180 },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
]

function loadSkills() {
  store.fetchSkills({
    status: filterStatus.value ?? undefined,
    validation_stage: filterStage.value ?? undefined
  })
}

function handleOptionsUpdate(options: { page: number; itemsPerPage: number }) {
  store.page = options.page
  store.size = options.itemsPerPage
  loadSkills()
}

function goToDetail(_: unknown, { item }: { item: SkillListItem }) {
  router.push(`/admin/skills/${item.skill_id}`)
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function canApprove(item: SkillListItem): boolean {
  return item.status === 'pending' && item.validation_stage === 'completed'
}

function canRevalidate(item: SkillListItem): boolean {
  return item.status === 'rejected' || item.status === 'pending'
}

async function handleApprove(item: SkillListItem) {
  try {
    await store.approveSkill(item.skill_id)
    notification.success(`Skill "${item.name}" 已批准入库`)
    loadSkills()
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '批准失败')
  }
}

async function handleRevalidate(item: SkillListItem) {
  try {
    await store.revalidateSkill(item.skill_id)
    notification.success(`Skill "${item.name}" 已开始重新验证`)
    loadSkills()
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '重新验证失败')
  }
}

function onUploaded() {
  showUpload.value = false
  loadSkills()
}

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (oldPath?.includes('/admin/skills/') && newPath === '/admin/skills') {
      loadSkills()
    }
  }
)

onMounted(() => {
  loadSkills()
})
</script>
