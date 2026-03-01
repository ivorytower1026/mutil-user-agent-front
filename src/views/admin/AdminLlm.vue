<template>
  <div>
    <h1 class="text-h5 mb-4">LLM 配置管理</h1>

    <v-card class="mb-4">
      <v-card-title class="text-subtitle-1 pb-0">当前模型配置</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-h6">
                    <v-icon color="error" class="mr-1">mdi-star</v-icon>
                    主模型
                  </span>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        size="small"
                        color="primary"
                        append-icon="mdi-chevron-down"
                      >
                        切换
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="config in bigConfigs"
                        :key="config.id"
                        :disabled="config.is_active"
                        @click="switchConfig(config)"
                      >
                        <v-list-item-title>
                          {{ config.name }}
                          <v-chip v-if="config.is_active" size="x-small" color="success" class="ml-2">
                            当前
                          </v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ PROVIDER_LABELS[config.provider] }} · {{ config.model_name }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-divider v-if="bigConfigs.length > 0" />
                      <v-list-item @click="openCreateDialogWithRole('big')">
                        <v-list-item-title>
                          <v-icon size="small" class="mr-1">mdi-plus</v-icon>
                          添加主模型
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <template v-if="activeBigConfig">
                  <div class="text-h6 font-weight-medium">{{ activeBigConfig.name }}</div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    <v-chip size="small" :color="getProviderColor(activeBigConfig.provider)" class="mr-2">
                      {{ PROVIDER_LABELS[activeBigConfig.provider] }}
                    </v-chip>
                    {{ activeBigConfig.model_name }}
                  </div>
                  <div v-if="activeBigConfig.display_name" class="text-caption text-medium-emphasis mt-1">
                    {{ activeBigConfig.display_name }}
                  </div>
                </template>
                <div v-else class="text-medium-emphasis">
                  未配置主模型
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-h6">
                    <v-icon color="success" class="mr-1">mdi-lightning-bolt</v-icon>
                    快速模型
                  </span>
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        size="small"
                        color="primary"
                        append-icon="mdi-chevron-down"
                      >
                        切换
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        v-for="config in flashConfigs"
                        :key="config.id"
                        :disabled="config.is_active"
                        @click="switchConfig(config)"
                      >
                        <v-list-item-title>
                          {{ config.name }}
                          <v-chip v-if="config.is_active" size="x-small" color="success" class="ml-2">
                            当前
                          </v-chip>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ PROVIDER_LABELS[config.provider] }} · {{ config.model_name }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-divider v-if="flashConfigs.length > 0" />
                      <v-list-item @click="openCreateDialogWithRole('flash')">
                        <v-list-item-title>
                          <v-icon size="small" class="mr-1">mdi-plus</v-icon>
                          添加快速模型
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <template v-if="activeFlashConfig">
                  <div class="text-h6 font-weight-medium">{{ activeFlashConfig.name }}</div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    <v-chip size="small" :color="getProviderColor(activeFlashConfig.provider)" class="mr-2">
                      {{ PROVIDER_LABELS[activeFlashConfig.provider] }}
                    </v-chip>
                    {{ activeFlashConfig.model_name }}
                  </div>
                  <div v-if="activeFlashConfig.display_name" class="text-caption text-medium-emphasis mt-1">
                    {{ activeFlashConfig.display_name }}
                  </div>
                </template>
                <div v-else class="text-medium-emphasis">
                  未配置快速模型
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        添加配置
      </v-btn>
    </div>

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
              <div class="font-weight-medium">
                {{ item.name }}
                <v-chip v-if="item.is_active" size="x-small" color="success" class="ml-2">
                  激活中
                </v-chip>
              </div>
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

          <template #item.actions="{ item }">
            <v-btn
              v-if="!item.is_active"
              size="small"
              variant="text"
              color="success"
              @click="switchConfig(item)"
            >
              激活
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
      :default-role="defaultRole"
      @saved="onSaved"
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
import type { LlmConfig, LlmProvider, LlmRole } from '@/types/llm'
import { PROVIDER_LABELS, ROLE_LABELS } from '@/types/llm'

const store = useLlmStore()
const notification = useNotification()

const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const editingConfig = ref<LlmConfig | null>(null)
const defaultRole = ref<LlmRole>('big')
const deletingConfig = ref<LlmConfig | null>(null)
const deleting = ref(false)

const headers = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'Provider', key: 'provider', sortable: false, width: 120 },
  { title: '模型', key: 'model_name', sortable: false },
  { title: '角色', key: 'role', sortable: false, width: 100 },
  { title: '操作', key: 'actions', sortable: false, width: 200 }
]

const bigConfigs = computed(() => store.configs.filter(c => c.role === 'big'))
const flashConfigs = computed(() => store.configs.filter(c => c.role === 'flash'))

const activeBigConfig = computed(() => bigConfigs.value.find(c => c.is_active))
const activeFlashConfig = computed(() => flashConfigs.value.find(c => c.is_active))

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
  defaultRole.value = 'big'
  showDialog.value = true
}

function openCreateDialogWithRole(role: LlmRole) {
  editingConfig.value = null
  defaultRole.value = role
  showDialog.value = true
}

function editConfig(config: LlmConfig) {
  editingConfig.value = config
  showDialog.value = true
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

async function switchConfig(config: LlmConfig) {
  try {
    await store.activateConfig(config.id)
    notification.success(`已切换到 "${config.name}"`)
  } catch (e) {
    notification.error(e instanceof Error ? e.message : '切换失败')
  }
}

function onSaved() {
  showDialog.value = false
  store.fetchConfigs()
}

onMounted(() => {
  store.fetchConfigs()
})
</script>
