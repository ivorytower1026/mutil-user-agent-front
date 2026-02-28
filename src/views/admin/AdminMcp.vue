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
