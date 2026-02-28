<template>
  <v-dialog :model-value="modelValue" max-width="500" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>上传 Skill</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="selectedFile"
          label="选择 ZIP 文件"
          accept=".zip"
          prepend-icon="mdi-file-zip"
          :rules="[rules.required]"
          class="mb-4"
        />
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-alert v-if="success" type="success">
          上传成功！Skill "{{ success }}" 已入库
        </v-alert>
        <p class="text-caption text-medium-emphasis">
          上传的 ZIP 文件将直接解压到 skills 目录，无需验证流程
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('update:modelValue', false)">关闭</v-btn>
        <v-btn
          color="primary"
          :loading="uploading"
          :disabled="!selectedFile"
          @click="handleUpload"
        >
          上传
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminApi } from '@/api/admin'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': []
}>()

const selectedFile = ref<File[]>([])
const uploading = ref(false)
const error = ref('')
const success = ref('')

const rules = {
  required: (v: File[]) => (v && v.length > 0) || '请选择文件'
}

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedFile.value = []
    error.value = ''
    success.value = ''
  }
})

async function handleUpload() {
  if (!selectedFile.value || selectedFile.value.length === 0) return

  uploading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await adminApi.uploadSkillSimple(selectedFile.value[0])
    success.value = result.name
    emit('uploaded')
    setTimeout(() => {
      emit('update:modelValue', false)
    }, 1500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '上传失败'
  } finally {
    uploading.value = false
  }
}
</script>
