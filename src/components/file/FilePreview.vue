<template>
  <v-dialog
    :model-value="modelValue"
    max-width="800"
    max-height="90vh"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card v-if="file">
      <v-card-title class="d-flex align-center">
        <span class="text-truncate">{{ file.name }}</span>
        <v-spacer />
        <v-btn
          icon="mdi-download"
          variant="text"
          @click="handleDownload"
        />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:model-value', false)"
        />
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="preview-content">
        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate />
        </div>
        
        <div v-else-if="error" class="error-state">
          <v-icon size="48" color="error">mdi-alert-circle</v-icon>
          <span>{{ error }}</span>
        </div>
        
        <img
          v-else-if="previewType === 'image'"
          :src="imageBlobUrl"
          class="preview-image"
          @error="handlePreviewError"
        />
        
        <iframe
          v-else-if="previewType === 'pdf'"
          :src="pdfBlobUrl"
          class="preview-pdf"
        />
        
        <pre v-else-if="previewType === 'text'" class="preview-text">{{ textContent }}</pre>
        
        <div v-else class="unsupported-state">
          <v-icon size="48" color="grey">mdi-file-question</v-icon>
          <span>无法预览此文件类型</span>
          <v-btn color="primary" @click="handleDownload">
            下载查看
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FileItem } from '@/types/file'
import { isImage, isTextFile } from '@/types/file'
import { downloadFile } from '@/api/webdav'

const props = defineProps<{
  modelValue: boolean
  file: FileItem | null
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'download': [file: FileItem]
}>()

const loading = ref(false)
const error = ref('')
const textContent = ref('')
const pdfBlobUrl = ref('')
const imageBlobUrl = ref('')

const previewType = computed(() => {
  if (!props.file) return null
  if (isImage(props.file.name)) return 'image'
  if (props.file.name.toLowerCase().endsWith('.pdf')) return 'pdf'
  if (isTextFile(props.file.name)) return 'text'
  return null
})

watch(() => props.modelValue, async (val) => {
  if (val && props.file) {
    if (previewType.value === 'text') {
      await loadTextContent()
    } else if (previewType.value === 'pdf') {
      await loadPdfContent()
    } else if (previewType.value === 'image') {
      await loadImageContent()
    }
  }
  if (!val) {
    if (pdfBlobUrl.value) {
      URL.revokeObjectURL(pdfBlobUrl.value)
      pdfBlobUrl.value = ''
    }
    if (imageBlobUrl.value) {
      URL.revokeObjectURL(imageBlobUrl.value)
      imageBlobUrl.value = ''
    }
  }
})

async function loadImageContent() {
  if (!props.file) return
  
  loading.value = true
  error.value = ''
  
  try {
    const blob = await downloadFile(props.file.path)
    const ext = props.file.name.split('.').pop()?.toLowerCase() || ''
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp'
    }
    const typedBlob = new Blob([blob], { type: mimeTypes[ext] || 'image/png' })
    imageBlobUrl.value = URL.createObjectURL(typedBlob)
  } catch (e) {
    error.value = '加载图片失败'
  } finally {
    loading.value = false
  }
}

async function loadTextContent() {
  if (!props.file) return
  
  loading.value = true
  error.value = ''
  
  try {
    const blob = await downloadFile(props.file.path)
    const text = await blob.text()
    textContent.value = text
  } catch (e) {
    error.value = '加载文件失败'
  } finally {
    loading.value = false
  }
}

async function loadPdfContent() {
  if (!props.file) return
  
  loading.value = true
  error.value = ''
  
  try {
    const blob = await downloadFile(props.file.path)
    const typedBlob = new Blob([blob], { type: 'application/pdf' })
    pdfBlobUrl.value = URL.createObjectURL(typedBlob)
  } catch (e) {
    error.value = '加载PDF失败'
  } finally {
    loading.value = false
  }
}

function handlePreviewError() {
  error.value = '预览加载失败'
}

function handleDownload() {
  if (props.file) {
    emit('download', props.file)
  }
}
</script>

<style scoped>
.preview-content {
  min-height: 300px;
  max-height: calc(90vh - 120px);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state,
.error-state,
.unsupported-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(0, 0, 0, 0.5);
}

.preview-image {
  max-width: 100%;
  max-height: calc(90vh - 150px);
  object-fit: contain;
}

.preview-pdf {
  width: 100%;
  height: calc(90vh - 150px);
  border: none;
}

.preview-text {
  width: 100%;
  margin: 0;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
  max-height: calc(90vh - 150px);
}

.v-theme--dark .preview-text {
  background-color: #1e1e1e;
}
</style>
