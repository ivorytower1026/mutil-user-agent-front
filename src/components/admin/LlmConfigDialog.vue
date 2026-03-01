<template>
  <v-dialog :model-value="modelValue" max-width="650" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ isEdit ? '编辑 LLM 配置' : '添加 LLM 配置' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                label="配置名称"
                :rules="[rules.required, rules.nameFormat]"
                :disabled="isEdit"
                hint="唯一标识符"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.display_name"
                label="显示名称"
                hint="可选"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.description"
            label="描述"
            class="mt-3"
          />

          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.provider"
                :items="providerOptions"
                label="Provider"
                :rules="[rules.required]"
                @update:model-value="onProviderChange"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.role"
                :items="roleOptions"
                label="角色"
                :rules="[rules.required]"
                :disabled="isEdit"
                hint="big=主模型, flash=快速模型"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="form.base_url"
            label="API 地址 (Base URL)"
            :rules="[rules.required]"
            class="mt-3"
          />

          <v-text-field
            v-model="form.api_key"
            label="API 密钥"
            :type="showApiKey ? 'text' : 'password'"
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            :rules="[rules.required]"
            class="mt-3"
            @click:append-inner="showApiKey = !showApiKey"
          />

          <v-text-field
            v-model="form.model_name"
            label="模型名称"
            :rules="[rules.required]"
            class="mt-3"
          />

          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.temperature"
                label="Temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                hint="默认 0.7"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.max_tokens"
                label="Max Tokens"
                type="number"
                min="1"
                hint="默认 4096"
                persistent-hint
              />
            </v-col>
          </v-row>

          <v-checkbox
            v-if="!isEdit"
            v-model="form.activate"
            label="创建后立即激活"
            color="primary"
            class="mt-2"
            hint="激活后同角色的其他配置将自动停用"
            persistent-hint
          />
        </v-form>

        <v-alert
          v-if="testResult"
          :type="testResult.success ? 'success' : 'error'"
          class="mt-4"
          closable
          @click:close="testResult = null"
        >
          <div class="d-flex align-center">
            <v-icon :icon="testResult.success ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-2" />
            <span>{{ testResult.message }}</span>
          </div>
          <div v-if="testResult.response_time_ms" class="mt-1 text-caption">
            响应时间: {{ testResult.response_time_ms }}ms
          </div>
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-connection"
          :loading="testing"
          :disabled="!canTest"
          @click="handleTest"
        >
          测试连接
        </v-btn>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">取消</v-btn>
        <v-btn color="primary" :disabled="!isValid" :loading="saving" @click="handleSave">
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLlmStore } from '@/stores/llm'
import { useNotification } from '@/stores/notification'
import type { LlmConfig, LlmConfigCreate, LlmProvider, LlmRole, LlmTestResult } from '@/types/llm'
import { PROVIDER_DEFAULT_URLS, PROVIDER_LABELS, ROLE_LABELS } from '@/types/llm'

const props = defineProps<{
  modelValue: boolean
  config: LlmConfig | null
  defaultRole?: LlmRole
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const store = useLlmStore()
const notification = useNotification()
const formRef = ref()
const isValid = ref(false)
const saving = ref(false)
const testing = ref(false)
const showApiKey = ref(false)
const testResult = ref<LlmTestResult | null>(null)

const isEdit = computed(() => !!props.config)

const canTest = computed(() => {
  return form.value.base_url && form.value.api_key && form.value.model_name
})

const form = ref<LlmConfigCreate>({
  name: '',
  display_name: '',
  description: '',
  provider: 'ollama',
  base_url: PROVIDER_DEFAULT_URLS.ollama,
  api_key: 'EMPTY',
  model_name: '',
  temperature: 0.7,
  max_tokens: 4096,
  role: 'big',
  activate: false
})

const providerOptions = Object.entries(PROVIDER_LABELS).map(([value, title]) => ({
  title,
  value
}))

const roleOptions = Object.entries(ROLE_LABELS).map(([value, title]) => ({
  title,
  value
}))

const rules = {
  required: (v: string) => !!v || '必填',
  nameFormat: (v: string) => /^[a-zA-Z0-9_-]+$/.test(v) || '只能包含字母、数字、连字符和下划线'
}

function onProviderChange(provider: LlmProvider) {
  form.value.base_url = PROVIDER_DEFAULT_URLS[provider]
  if (provider === 'ollama' || provider === 'vllm') {
    form.value.api_key = 'EMPTY'
  } else {
    form.value.api_key = ''
  }
  testResult.value = null
}

watch(() => props.modelValue, (val) => {
  if (val) {
    showApiKey.value = false
    testResult.value = null
    if (props.config) {
      form.value = {
        name: props.config.name,
        display_name: props.config.display_name || '',
        description: props.config.description || '',
        provider: props.config.provider,
        base_url: props.config.base_url,
        api_key: '',
        model_name: props.config.model_name,
        temperature: props.config.temperature,
        max_tokens: props.config.max_tokens,
        role: props.config.role,
        activate: false
      }
    } else {
      resetForm()
      if (props.defaultRole) {
        form.value.role = props.defaultRole
      }
    }
  }
})

function resetForm() {
  form.value = {
    name: '',
    display_name: '',
    description: '',
    provider: 'ollama',
    base_url: PROVIDER_DEFAULT_URLS.ollama,
    api_key: 'EMPTY',
    model_name: '',
    temperature: 0.7,
    max_tokens: 4096,
    role: 'big',
    activate: false
  }
}

async function handleTest() {
  if (!canTest.value) return
  
  testResult.value = null
  notification.info('正在请求 LLM 连接...')
  testing.value = true
  
  try {
    testResult.value = await store.testConnection({
      base_url: form.value.base_url,
      api_key: form.value.api_key,
      model_name: form.value.model_name
    })
    
    if (testResult.value.success) {
      notification.success(`连接成功！响应时间: ${testResult.value.response_time_ms}ms`)
    } else {
      notification.error(`连接失败: ${testResult.value.message}`)
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : '测试失败'
    testResult.value = {
      success: false,
      message: errorMsg
    }
    notification.error(errorMsg)
  } finally {
    testing.value = false
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    if (isEdit.value) {
      const updateData = {
        display_name: form.value.display_name || undefined,
        description: form.value.description || undefined,
        base_url: form.value.base_url,
        api_key: form.value.api_key || undefined,
        model_name: form.value.model_name,
        temperature: form.value.temperature,
        max_tokens: form.value.max_tokens
      }
      await store.updateConfig(props.config!.id, updateData)
    } else {
      await store.createConfig(form.value)
    }
    emit('saved')
    emit('update:modelValue', false)
  } finally {
    saving.value = false
  }
}
</script>
