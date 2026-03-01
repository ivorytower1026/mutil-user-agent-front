<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">LLM 配置管理</h1>
      <div class="d-flex ga-2">
        <v-btn color="secondary" prepend-icon="mdi-connection" @click="openTestDialog">
          测试连接
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          添加配置
        </v-btn>
      </div>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterRole"
              :items="roleFilterOptions"
              label="角色筛选"
              clearable
              density="compact"
              @update:model-value="applyFilter"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterProvider"
              :items="providerFilterOptions"
              label="Provider 筛选"
              clearable
              density="compact"
              @update:model-value="applyFilter"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text>
        <v-data-table
          :items="store.configs"
          :loading="store.isLoading"
          :headers="headers"
          hover
        >
          <template #item.name="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div v-if="item.display_name" class="text-caption text-medium-emphasis">
                {{ item.display_name }}
              </div>
            </div>
          </template>

          <template #item.provider="{ item }">
            <v-chip size="small" :color="getProviderColor(item.provider)">
              {{ PROVIDER_LABELS[item.provider] }}
            </v-chip>
          </template>

          <template #item.role="{ item }">
            <v-chip size="small" :color="getRoleColor(item.role)">
              {{ ROLE_LABELS[item.role] }}
            </v-chip>
          </template>

          <template #item.is_active="{ item }">
            <v-switch
              v-model="item.is_active"
              color="success"
              hide-details
              @update:model-value="toggleActive(item)"
            />
          </template>

          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="testConfig(item)">
              测试
            </v-btn>
            <v-btn size="small" variant="text" @click="editConfig(item)">
              编辑
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="confirmDelete(item)">
              删除
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <LlmConfigDialog
      v-model="showDialog"
      :config="editingConfig"
      @saved="onSaved"
    />

    <LlmTestDialog
      v-model="showTestDialog"
      :initial-data="testingData"
    />

    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          确定要删除 LLM 配置 "{{ deletingConfig?.name }}" 吗？
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteConfirm = false">取消</v-btn>
          <v-btn color="error" :loading="deleting" @click="doDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLlmStore } from '@/stores/llm'
import { useNotification } from '@/stores/notification'
import LlmConfigDialog from '@/components/admin/LlmConfigDialog.vue'
import LlmTestDialog from '@/components/admin/LlmTestDialog.vue'
import type { LlmConfig, LlmProvider, LlmRole } from '@/types/llm'
import { PROVIDER_LABELS, ROLE_LABELS } from '@/types/llm'

const store = useLlmStore()
const notification = useNotification()

const showDialog = ref(false)
const showTestDialog = ref(false)
const showDeleteConfirm = ref(false)
const editingConfig = ref<LlmConfig | null>(null)
const testingData = ref<{ base_url: string; api_key: string; model_name: string } | undefined>()
const deletingConfig = ref<LlmConfig | null>(null)
const deleting = ref(false)

const filterRole = ref<string | null>(null)
const filterProvider = ref<string | null>(null)

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'Provider', key: 'provider', sortable: false, width: 100 },
  { title: '模型', key: 'model_name', sortable: false },
  { title: '角色', key: 'role', sortable: false, width: 100 },
  { title: '状态', key: 'is_active', sortable: false, width: 80 },
  { title: '操作', key: 'actions', sortable: false, width: 200 }
]

const roleFilterOptions = Object.entries(ROLE_LABELS).map(([value, title]) => ({
  title,
  value
}))

const providerFilterOptions = Object.entries(PROVIDER_LABELS).map(([value, title]) => ({
  title,
  value
}))

function getProviderColor(provider: LlmProvider): string {
  switch (provider) {
    case 'ollama': return 'success'
    case 'vllm': return 'primary'
    case 'openai': return 'warning'
    case 'zhipuai': return 'info'
    default: return 'default'
  }
}

function getRoleColor(role: LlmRole): string {
  switch (role) {
    case 'big': return 'error'
    case 'flash': return 'success'
    default: return 'default'
  }
}

function openCreateDialog() {
  editingConfig.value = null
  showDialog.value = true
}

function editConfig(config: LlmConfig) {
  editingConfig.value = config
  showDialog.value = true
}

function testConfig(config: LlmConfig) {
  testingData.value = {
    base_url: config.base_url,
    api_key: '',
    model_name: config.model_name
  }
  showTestDialog.value = true
}

function openTestDialog() {
  testingData.value = undefined
  showTestDialog.value = true
}

function confirmDelete(config: LlmConfig) {
  deletingConfig.value = config
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingConfig.value) return
  deleting.value = true
  try {
    await store.deleteConfig(deletingConfig.value.id)
    notification.success(`LLM 配置 "${deletingConfig.value.name}" 已删除`)
    showDeleteConfirm.value = false
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleting.value = false
  }
}

async function toggleActive(config: LlmConfig) {
  try {
    if (config.is_active) {
      await store.activateConfig(config.id)
      notification.success(`LLM 配置 "${config.name}" 已激活`)
    } else {
      notification.warning('不能直接停用配置，请激活其他配置来替换')
      config.is_active = true
    }
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '操作失败')
    config.is_active = !config.is_active
  }
}

function onSaved() {
  showDialog.value = false
  store.fetchConfigs()
}

function applyFilter() {
  store.fetchConfigs({
    role: filterRole.value || undefined,
    provider: filterProvider.value || undefined
  })
}

onMounted(() => {
  store.fetchConfigs()
})
</script>
