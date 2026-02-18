<template>
  <div>
    <div v-if="store.isLoading" class="text-center py-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="store.currentSkill">
      <div class="d-flex align-center mb-4">
        <v-btn icon="mdi-arrow-left" variant="text" to="/admin/skills" />
        <h1 class="text-h5 ml-2">
          {{ store.currentSkill.display_name || store.currentSkill.name }}
        </h1>
        <SkillStatusChip
          :status="store.currentSkill.status"
          :stage="store.currentSkill.validation_stage"
          class="ml-4"
        />
      </div>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="mb-4">
            <v-card-title>验证报告</v-card-title>
            <v-card-text>
              <div v-if="store.reportLoading" class="text-center py-4">
                <v-progress-circular indeterminate size="small" />
                <span class="ml-2">加载报告中...</span>
              </div>
              <MarkdownRenderer v-else :content="store.currentReport" />
            </v-card-text>
          </v-card>

          <v-card v-if="store.currentSkill.task_results?.length" class="mb-4">
            <v-card-title>任务执行详情</v-card-title>
            <v-card-text>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>任务</th>
                    <th>状态</th>
                    <th>使用 Skill</th>
                    <th>执行时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in store.currentSkill.task_results" :key="task.task">
                    <td>{{ task.task }}</td>
                    <td>
                      <v-icon :color="task.completed ? 'success' : 'error'" size="small">
                        {{ task.completed ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                    </td>
                    <td>
                      <span :class="{ 'text-success': task.correct_skill_used }">
                        {{ task.skill_used || '-' }}
                      </span>
                    </td>
                    <td>{{ task.execution_time_ms }}ms</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <ScoreCard v-if="store.currentSkill.validation_score != null" :skill="store.currentSkill" class="mb-4" />

          <v-card v-if="canApprove" class="mb-4">
            <v-card-title>审批操作</v-card-title>
            <v-card-text>
              <v-textarea
                v-model="rejectReason"
                label="拒绝原因（可选）"
                rows="2"
                density="compact"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" variant="outlined" @click="handleReject" :loading="rejecting">
                拒绝
              </v-btn>
              <v-spacer />
              <v-btn color="success" @click="handleApprove" :loading="approving">
                批准入库
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>基本信息</v-card-title>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>ID</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.skill_id }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>名称</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="store.currentSkill.description">
                <v-list-item-title>描述</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.description }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>创建时间</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(store.currentSkill.created_at) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="store.currentSkill.validated_at">
                <v-list-item-title>验证时间</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(store.currentSkill.validated_at) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="store.currentSkill.runtime_image_version">
                <v-list-item-title>镜像版本</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.runtime_image_version }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card v-if="store.currentSkill.format_errors?.length || store.currentSkill.format_warnings?.length" class="mb-4">
            <v-card-title>格式检查</v-card-title>
            <v-card-text>
              <v-alert v-if="store.currentSkill.format_errors?.length" type="error" class="mb-2">
                <div v-for="err in store.currentSkill.format_errors" :key="err">- {{ err }}</div>
              </v-alert>
              <v-alert v-if="store.currentSkill.format_warnings?.length" type="warning">
                <div v-for="warn in store.currentSkill.format_warnings" :key="warn">- {{ warn }}</div>
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card v-if="store.currentSkill.execution_metrics" class="mb-4">
            <v-card-title>执行监控</v-card-title>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>CPU 使用率</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.execution_metrics.cpu_percent }}%</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>内存使用</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.execution_metrics.memory_mb }} MB</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>磁盘读取</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.execution_metrics.disk_read_mb }} MB</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>磁盘写入</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.execution_metrics.disk_write_mb }} MB</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>执行时间</v-list-item-title>
                <v-list-item-subtitle>{{ store.currentSkill.execution_metrics.execution_time_sec }} 秒</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card v-if="Object.keys(store.currentSkill.regression_results || {}).length" class="mb-4">
            <v-card-title>回归测试结果</v-card-title>
            <v-list density="compact">
              <v-list-item
                v-for="(result, skillName) in store.currentSkill.regression_results"
                :key="skillName"
              >
                <v-list-item-title>{{ skillName }}</v-list-item-title>
                <template #append>
                  <v-icon :color="result.passed ? 'success' : 'error'" size="small">
                    {{ result.passed ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card v-if="canRevalidate" class="mb-4">
            <v-card-title>其他操作</v-card-title>
            <v-card-actions>
              <v-btn
                color="info"
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="handleRevalidate"
                :loading="revalidating"
              >
                重新验证
              </v-btn>
              <v-btn
                v-if="canDelete"
                color="error"
                variant="text"
                prepend-icon="mdi-delete"
                @click="handleDelete"
                :loading="deleting"
              >
                删除
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-alert v-else type="error">
      未找到 Skill 信息
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminSkillStore } from '@/stores/adminSkill'
import { useNotification } from '@/stores/notification'
import SkillStatusChip from '@/components/admin/SkillStatusChip.vue'
import ScoreCard from '@/components/admin/ScoreCard.vue'
import MarkdownRenderer from '@/components/chat/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const store = useAdminSkillStore()
const notification = useNotification()

const rejectReason = ref('')
const approving = ref(false)
const rejecting = ref(false)
const revalidating = ref(false)
const deleting = ref(false)

const canApprove = computed(() => {
  const skill = store.currentSkill
  return skill && skill.status === 'pending' && skill.validation_stage === 'completed'
})

const canRevalidate = computed(() => {
  const skill = store.currentSkill
  return skill && (skill.status === 'rejected' || skill.status === 'pending')
})

const canDelete = computed(() => {
  const skill = store.currentSkill
  return skill && (skill.status === 'rejected' || skill.status === 'approved')
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function handleApprove() {
  if (!store.currentSkill) return
  approving.value = true
  try {
    await store.approveSkill(store.currentSkill.skill_id)
    notification.success('已批准入库')
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '批准失败')
  } finally {
    approving.value = false
  }
}

async function handleReject() {
  if (!store.currentSkill) return
  rejecting.value = true
  try {
    await store.rejectSkill(store.currentSkill.skill_id, rejectReason.value || '未通过审核')
    notification.success('已拒绝')
    rejectReason.value = ''
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '拒绝失败')
  } finally {
    rejecting.value = false
  }
}

async function handleRevalidate() {
  if (!store.currentSkill) return
  revalidating.value = true
  try {
    await store.revalidateSkill(store.currentSkill.skill_id)
    notification.success('已开始重新验证')
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '重新验证失败')
  } finally {
    revalidating.value = false
  }
}

async function handleDelete() {
  if (!store.currentSkill) return
  if (!confirm('确定要删除这个 Skill 吗？')) return
  deleting.value = true
  try {
    await store.deleteSkill(store.currentSkill.skill_id)
    notification.success('已删除')
    router.push('/admin/skills')
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  const skillId = route.params.id as string
  store.fetchSkillDetail(skillId)
  store.fetchSkillReport(skillId)
})

onUnmounted(() => {
  store.clearCurrentSkill()
})
</script>
