<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title>上传 Skill</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="selectedFile"
          label="选择 Skill ZIP 文件"
          accept=".zip"
          prepend-icon="mdi-zip-box"
          :disabled="uploading"
          show-size
        />

        <v-alert v-if="error" type="error" class="mt-2">
          {{ error }}
        </v-alert>

        <v-alert v-if="uploadResult" :type="uploadResult.format_valid ? 'success' : 'warning'" class="mt-2">
          <div><strong>{{ uploadResult.name }}</strong></div>
          <div>{{ uploadResult.message }}</div>
          <div v-if="uploadResult.format_errors.length" class="mt-2">
            <div v-for="err in uploadResult.format_errors" :key="err">- {{ err }}</div>
          </div>
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="uploading">取消</v-btn>
        <v-btn
          color="primary"
          @click="handleUpload"
          :disabled="!selectedFile || uploading"
          :loading="uploading"
        >
          上传
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { adminApi } from '@/api/admin'
import type { UploadResponse } from '@/types/admin'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  uploaded: [result: UploadResponse]
}>()

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const error = ref<string | null>(null)
const uploadResult = ref<UploadResponse | null>(null)

async function handleUpload() {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = null
  uploadResult.value = null

  try {
    const result = await adminApi.uploadSkill(selectedFile.value)
    uploadResult.value = result
    if (result.format_valid) {
      emit('uploaded', result)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : '上传失败'
  } finally {
    uploading.value = false
  }
}

function close() {
  selectedFile.value = null
  error.value = null
  uploadResult.value = null
  emit('update:modelValue', false)
}
</script>
