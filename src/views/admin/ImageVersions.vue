<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">镜像版本管理</h1>
      <v-chip color="primary" variant="flat">
        当前版本: {{ store.currentImageVersion || '-' }}
      </v-chip>
    </div>

    <v-card>
      <v-card-text>
        <v-data-table
          :items="store.imageVersions"
          :loading="store.imagesLoading"
          :headers="headers"
          item-value="version"
        >
          <template #item.version="{ item }">
            <div class="d-flex align-center">
              <span class="font-weight-medium">{{ item.version }}</span>
              <v-chip v-if="item.is_current" color="success" size="x-small" class="ml-2">
                当前
              </v-chip>
            </div>
          </template>
          <template #item.skill_name="{ item }">
            <router-link
              v-if="item.skill_id"
              :to="`/admin/skills/${item.skill_id}`"
              class="text-primary"
            >
              {{ item.skill_name || item.skill_id }}
            </router-link>
            <span v-else class="text-medium-emphasis">基础镜像</span>
          </template>
          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
          <template #item.actions="{ item }">
            <v-btn
              v-if="!item.is_current"
              size="small"
              color="warning"
              variant="outlined"
              @click="showRollbackDialog(item.version)"
            >
              回滚到此版本
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog v-model="rollbackDialog" max-width="500">
      <v-card>
        <v-card-title>确认回滚</v-card-title>
        <v-card-text>
          <p>确定要回滚到版本 <strong>{{ targetVersion }}</strong> 吗？</p>
          <v-alert v-if="rollbackResult" :type="rollbackResult.affected_skills.length ? 'warning' : 'info'" class="mt-3">
            <div v-if="rollbackResult.affected_skills.length">
              <p class="font-weight-medium">受影响的 Skill：</p>
              <ul>
                <li v-for="skill in rollbackResult.affected_skills" :key="skill">{{ skill }}</li>
              </ul>
              <p class="mt-2 text-caption">这些 Skill 将被标记为回滚待处理，需要重新验证。</p>
            </div>
            <div v-else>
              此回滚不会影响任何已入库的 Skill。
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rollbackDialog = false">取消</v-btn>
          <v-btn color="warning" @click="executeRollback" :loading="rollingBack">
            确认回滚
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminSkillStore } from '@/stores/adminSkill'
import { useNotification } from '@/stores/notification'
import type { RollbackResponse } from '@/types/admin'

const store = useAdminSkillStore()
const notification = useNotification()

const rollbackDialog = ref(false)
const targetVersion = ref('')
const rollingBack = ref(false)
const rollbackResult = ref<RollbackResponse | null>(null)

const headers = [
  { title: '版本', key: 'version', sortable: false },
  { title: '关联 Skill', key: 'skill_name', sortable: false },
  { title: '创建时间', key: 'created_at', sortable: false },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function showRollbackDialog(version: string) {
  targetVersion.value = version
  rollbackResult.value = null
  rollbackDialog.value = true
}

async function executeRollback() {
  rollingBack.value = true
  try {
    rollbackResult.value = await store.rollbackImage(targetVersion.value)
    notification.success(rollbackResult.value.message)
    rollbackDialog.value = false
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '回滚失败')
  } finally {
    rollingBack.value = false
  }
}

onMounted(() => {
  store.fetchImageVersions()
})
</script>
