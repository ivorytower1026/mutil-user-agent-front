<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ isEdit ? '编辑子agent' : '创建子agent' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="form.name"
            label="名称"
            :rules="[rules.required, rules.nameFormat]"
            :disabled="isEdit"
            class="mb-3"
          />

          <v-text-field
            v-model="form.description"
            label="描述"
            class="mb-3"
          />

          <v-textarea
            v-model="form.system_prompt"
            label="System Prompt"
            rows="4"
            auto-grow
            class="mb-3"
          />

          <v-combobox
            v-model="form.mcp_servers"
            :items="availableMcpServers"
            label="MCP 服务"
            multiple
            chips
            closable-chips
            class="mb-3"
          />

          <v-text-field
            v-model="form.model"
            label="模型 (可选)"
            placeholder="如: openai:gpt-4o"
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
import { useAgentConfigStore } from '@/stores/agentConfig'
import type { AgentConfig, SubagentCreate, SubagentUpdate } from '@/types/agentConfig'

const props = defineProps<{
  modelValue: boolean
  subagent: AgentConfig | null
  availableMcpServers: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const store = useAgentConfigStore()
const formRef = ref()
const isValid = ref(false)

const isEdit = computed(() => !!props.subagent)

const form = ref<SubagentCreate>({
  name: '',
  description: '',
  system_prompt: '',
  mcp_servers: [],
  model: ''
})

const rules = {
  required: (v: string) => !!v || '必填',
  nameFormat: (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) || '只能包含字母、数字、连字符和下划线'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.subagent) {
      form.value = {
        name: props.subagent.name,
        description: props.subagent.description || '',
        system_prompt: props.subagent.system_prompt || '',
        mcp_servers: props.subagent.mcp_servers || [],
        model: props.subagent.model || ''
      }
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  form.value = {
    name: '',
    description: '',
    system_prompt: '',
    mcp_servers: [],
    model: ''
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    const data: SubagentCreate | SubagentUpdate = {
      description: form.value.description || undefined,
      system_prompt: form.value.system_prompt || undefined,
      mcp_servers: form.value.mcp_servers || undefined,
      model: form.value.model || undefined
    }

    if (isEdit.value) {
      await store.updateSubagent(props.subagent!.name, data as SubagentUpdate)
    } else {
      await store.createSubagent(form.value as SubagentCreate)
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (e) {
    throw e
  }
}
</script>
