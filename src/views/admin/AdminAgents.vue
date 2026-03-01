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
              v-model="mainForm.mcp_servers"
              :items="availableMcpServers"
              label="MCP 服务"
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
          <template #item.mcp_servers="{ item }">
            <v-chip v-for="server in item.mcp_servers.slice(0, 3)" :key="server" size="x-small" class="mr-1">
              {{ server }}
            </v-chip>
            <span v-if="item.mcp_servers.length > 3" class="text-caption">
              +{{ item.mcp_servers.length - 3 }}
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
      :available-mcp-servers="availableMcpServers"
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
import { useMcpStore } from '@/stores/mcp'
import { adminApi } from '@/api/admin'
import { useNotification } from '@/stores/notification'
import SubagentDialog from '@/components/admin/SubagentDialog.vue'
import type { AgentConfig } from '@/types/agentConfig'

const store = useAgentConfigStore()
const mcpStore = useMcpStore()
const notification = useNotification()

const savingMain = ref(false)
const showSubagentDialog = ref(false)
const showDeleteConfirm = ref(false)
const editingSubagent = ref<AgentConfig | null>(null)
const deletingSubagent = ref<AgentConfig | null>(null)

const mainForm = ref({
  system_prompt: '',
  mcp_servers: [] as string[],
  skills: [] as string[],
  subagents: [] as string[]
})

const subagentHeaders = [
  { title: '名称', key: 'name', sortable: false },
  { title: 'MCP 服务', key: 'mcp_servers', sortable: false },
  { title: 'Skills 数', key: 'skills', sortable: false, width: 100 },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
]

const availableMcpServers = ref<string[]>([])
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

async function loadAvailableData() {
  await mcpStore.fetchServers()
  availableMcpServers.value = mcpStore.servers
    .filter(s => s.enabled)
    .map(s => s.name)

  const simpleSkills = await adminApi.getSimpleSkills()
  availableSkills.value = simpleSkills.skills.map(s => s.name)
}

onMounted(async () => {
  await store.fetchAll()
  await loadAvailableData()
  if (store.mainConfig) {
    mainForm.value = {
      system_prompt: store.mainConfig.system_prompt || '',
      mcp_servers: [...(store.mainConfig.mcp_servers || [])],
      skills: [...(store.mainConfig.skills || [])],
      subagents: [...(store.mainConfig.subagents || [])]
    }
  }
})
</script>
