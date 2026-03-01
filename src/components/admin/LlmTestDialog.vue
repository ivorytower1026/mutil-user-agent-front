<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>测试 LLM 连接</v-card-title>
      <v-card-text>
        <v-form ref="formRef" v-model="isValid">
          <v-text-field
            v-model="form.base_url"
            label="API 地址 (Base URL)"
            :rules="[rules.required]"
            class="mb-3"
          />

          <v-text-field
            v-model="form.api_key"
            label="API 密钥"
            :type="showApiKey ? 'text' : 'password'"
            :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
            :rules="[rules.required]"
            class="mb-3"
            @click:append-inner="showApiKey = !showApiKey"
          />

          <v-text-field
            v-model="form.model_name"
            label="模型名称"
            :rules="[rules.required]"
          />
        </v-form>

        <v-alert
          v-if="result"
          :type="result.success ? 'success' : 'error'"
          class="mt-4"
        >
          <div class="d-flex align-center">
            <v-icon :icon="result.success ? 'mdi-check-circle' : 'mdi-alert-circle'" class="mr-2" />
            <span>{{ result.message }}</span>
          </div>
          <div v-if="result.response_time_ms" class="mt-2 text-caption">
            响应时间: {{ result.response_time_ms }}ms
          </div>
          <div v-if="result.response_preview" class="mt-2 text-caption">
            响应预览: {{ result.response_preview }}
          </div>
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">关闭</v-btn>
        <v-btn 
          color="primary" 
          :disabled="!isValid" 
          :loading="testing"
          @click="handleTest"
        >
          测试连接
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLlmStore } from '@/stores/llm'
import type { LlmTestResult } from '@/types/llm'

const props = defineProps<{
  modelValue: boolean
  initialData?: {
    base_url: string
    api_key: string
    model_name: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useLlmStore()
const formRef = ref()
const isValid = ref(false)
const testing = ref(false)
const showApiKey = ref(false)
const result = ref<LlmTestResult | null>(null)

const form = ref({
  base_url: '',
  api_key: '',
  model_name: ''
})

const rules = {
  required: (v: string) => !!v || '必填'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    result.value = null
    showApiKey.value = false
    if (props.initialData) {
      form.value = { ...props.initialData }
    } else {
      form.value = {
        base_url: '',
        api_key: '',
        model_name: ''
      }
    }
  }
})

async function handleTest() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  testing.value = true
  try {
    result.value = await store.testConnection(form.value)
  } finally {
    testing.value = false
  }
}
</script>
