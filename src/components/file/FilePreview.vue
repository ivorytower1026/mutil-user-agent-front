<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1200"
    max-height="95vh"
    @update:model-value="$emit('update:model-value', $event)"
    @keydown.ctrl.s.prevent="handleSave"
  >
    <v-card v-if="file">
      <v-card-title class="d-flex align-center">
        <span class="text-truncate">{{ file.name }}</span>
        <v-spacer />
        <v-btn
          v-if="previewType === 'text'"
          icon="mdi-content-save"
          variant="text"
          :loading="saving"
          @click="handleSave"
        />
        <v-btn icon="mdi-download" variant="text" @click="handleDownload" />
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('update:model-value', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text
        class="preview-content"
        :class="{ 'has-text': previewType === 'text' }"
      >
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

        <Codemirror
          v-else-if="previewType === 'text'"
          v-model="textContent"
          class="preview-editor"
          :extensions="extensions"
        />

        <div v-else class="unsupported-state">
          <v-icon size="48" color="grey">mdi-file-question</v-icon>
          <span>无法预览此文件类型</span>
          <v-btn color="primary" @click="handleDownload"> 下载查看 </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import type { FileItem } from "@/types/file";
import { isImage, isTextFile } from "@/types/file";
import { downloadFile, uploadFile } from "@/api/webdav";
import { useNotification } from "@/stores/notification";

const props = defineProps<{
  modelValue: boolean;
  file: FileItem | null;
}>();

const emit = defineEmits<{
  "update:model-value": [value: boolean];
  download: [file: FileItem];
}>();

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const textContent = ref("");
const pdfBlobUrl = ref("");
const imageBlobUrl = ref("");

const notification = useNotification();

const extensions = computed(() => {
  if (!props.file) return [];
  const ext = props.file.name.split(".").pop()?.toLowerCase() || "";
  const langMap: Record<string, ReturnType<typeof javascript>> = {
    js: javascript(),
    jsx: javascript({ jsx: true }),
    ts: javascript({ typescript: true }),
    tsx: javascript({ jsx: true, typescript: true }),
    py: python(),
    md: markdown(),
    html: html(),
    htm: html(),
    css: css(),
    json: json(),
  };
  const langExt = langMap[ext] || javascript();
  return [langExt, oneDark];
});

const previewType = computed(() => {
  if (!props.file) return null;
  if (isImage(props.file.name)) return "image";
  if (props.file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (isTextFile(props.file.name)) return "text";
  return null;
});

watch(
  () => props.modelValue,
  async (val) => {
    if (val && props.file) {
      if (previewType.value === "text") {
        await loadTextContent();
      } else if (previewType.value === "pdf") {
        await loadPdfContent();
      } else if (previewType.value === "image") {
        await loadImageContent();
      }
    }
    if (!val) {
      if (pdfBlobUrl.value) {
        URL.revokeObjectURL(pdfBlobUrl.value);
        pdfBlobUrl.value = "";
      }
      if (imageBlobUrl.value) {
        URL.revokeObjectURL(imageBlobUrl.value);
        imageBlobUrl.value = "";
      }
    }
  }
);

async function loadImageContent() {
  if (!props.file) return;

  loading.value = true;
  error.value = "";

  try {
    const blob = await downloadFile(props.file.path);
    const ext = props.file.name.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      bmp: "image/bmp",
    };
    const typedBlob = new Blob([blob], { type: mimeTypes[ext] || "image/png" });
    imageBlobUrl.value = URL.createObjectURL(typedBlob);
  } catch (e) {
    error.value = "加载图片失败";
  } finally {
    loading.value = false;
  }
}

async function loadTextContent() {
  if (!props.file) return;

  loading.value = true;
  error.value = "";

  try {
    const blob = await downloadFile(props.file.path);
    const text = await blob.text();
    textContent.value = text;
  } catch (e) {
    error.value = "加载文件失败";
  } finally {
    loading.value = false;
  }
}

async function loadPdfContent() {
  if (!props.file) return;

  loading.value = true;
  error.value = "";

  try {
    const blob = await downloadFile(props.file.path);
    const typedBlob = new Blob([blob], { type: "application/pdf" });
    pdfBlobUrl.value = URL.createObjectURL(typedBlob);
  } catch (e) {
    error.value = "加载PDF失败";
  } finally {
    loading.value = false;
  }
}

function handlePreviewError() {
  error.value = "预览加载失败";
}

function handleDownload() {
  if (props.file) {
    emit("download", props.file);
  }
}

async function handleSave() {
  if (!props.file || saving.value) return;

  saving.value = true;

  try {
    await uploadFile(props.file.path, textContent.value);
    notification.success("保存成功");
  } catch (e) {
    notification.error("保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.preview-content {
  min-height: 400px;
  max-height: calc(95vh - 100px);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
}

.preview-content.has-text {
  align-items: flex-start;
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
  width: 100%;
  height: calc(95vh - 100px);
}

.preview-image {
  max-width: 100%;
  max-height: calc(95vh - 100px);
  object-fit: contain;
}

.preview-pdf {
  width: 100%;
  height: calc(95vh - 100px);
  border: none;
}

.preview-editor {
  width: 100%;
  height: calc(95vh - 100px);
  overflow: hidden;
}

.preview-editor :deep(.cm-editor) {
  height: 100%;
}

.preview-editor :deep(.cm-scroller) {
  overflow: auto;
}
</style>
