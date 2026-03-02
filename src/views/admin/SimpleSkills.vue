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
