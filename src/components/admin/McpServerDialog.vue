<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ isEdit ? '编辑 MCP 服务' : '添加 MCP 服务' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="form.name"
            label="服务名称"
            :rules="[rules.required, rules.nameFormat]"
            :disabled="isEdit"
            class="mb-3"
          />

          <v-select
            v-model="form.transport"
            :items="transportOptions"
            label="传输方式"
            :rules="[rules.required]"
            class="mb-3"
          />

          <template v-if="form.transport === 'stdio'">
            <v-text-field
              v-model="form.command"
              label="命令"
              :rules="[rules.requiredCommand]"
              class="mb-3"
            />
            <v-textarea
              v-model="argsText"
              label="参数（每行一个）"
              rows="3"
              class="mb-3"
            />
            <v-textarea
              v-model="envText"
              label="环境变量（KEY=VALUE 格式，每行一个）"
              rows="3"
            />
          </template>

          <template v-if="form.transport === 'http' || form.transport === 'sse'">
            <v-text-field
              v-model="form.url"
              label="URL"
              :rules="[rules.requiredUrl]"
              class="mb-3"
            />
            <v-textarea
              v-model="headersText"
              label="请求头（KEY: VALUE 格式，每行一个）"
              rows="3"
            />
          </template>

          <v-switch
            v-model="form.enabled"
            label="启用"
            color="success"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">取消</v-btn>
        <v-btn color="primary" :disabled="!isValid" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMcpStore } from '@/stores/mcp'
import type { McpServer, McpServerCreate } from '@/types/mcp'

const props = defineProps<{
  modelValue: boolean
  server: McpServer | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const store = useMcpStore()
const formRef = ref()
const isValid = ref(false)

const isEdit = computed(() => !!props.server)

const form = ref<McpServerCreate>({
  name: '',
  transport: 'stdio',
  command: '',
  args: [],
  url: '',
  env: {},
  headers: {},
  enabled: true
})

const argsText = ref('')
const envText = ref('')
const headersText = ref('')

const transportOptions = [
  { title: 'STDIO', value: 'stdio' },
  { title: 'HTTP', value: 'http' },
  { title: 'SSE', value: 'sse' }
]

const rules = {
  required: (v: string) => !!v || '必填',
  nameFormat: (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) || '只能包含字母、数字、连字符和下划线',
  requiredCommand: () => form.value.transport !== 'stdio' || !!form.value.command || 'stdio模式必填',
  requiredUrl: () => (form.value.transport !== 'http' && form.value.transport !== 'sse') || !!form.value.url || 'http/sse模式必填'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.server) {
      form.value = {
        name: props.server.name,
        transport: props.server.transport,
        command: props.server.command || '',
        args: props.server.args || [],
        url: props.server.url || '',
        env: props.server.env || {},
        headers: props.server.headers || {},
        enabled: props.server.enabled
      }
      argsText.value = (props.server.args || []).join('\n')
      envText.value = Object.entries(props.server.env || {}).map(([k, v]) => `${k}=${v}`).join('\n')
      headersText.value = Object.entries(props.server.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  form.value = {
    name: '',
    transport: 'stdio',
    command: '',
    args: [],
    url: '',
    env: {},
    headers: {},
    enabled: true
  }
  argsText.value = ''
  envText.value = ''
  headersText.value = ''
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  form.value.args = argsText.value.split('\n').filter(Boolean)
  form.value.env = parseKeyValue(envText.value, '=')
  form.value.headers = parseKeyValue(headersText.value, ': ')

  try {
    if (isEdit.value) {
      await store.updateServer(props.server!.name, form.value)
    } else {
      await store.createServer(form.value)
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    throw e
  }
}

function parseKeyValue(text: string, separator: string): Record<string, string> {
  const result: Record<string, string> = {}
  text.split('\n').filter(Boolean).forEach(line => {
    const idx = line.indexOf(separator)
    if (idx > 0) {
      result[line.slice(0, idx).trim()] = line.slice(idx + separator.length).trim()
    }
  })
  return result
}
</script>
