<template>
  <div class="upload-queue">
    <div class="queue-header">
      <span class="title">上传队列 ({{ tasks.length }})</span>
      <v-btn
        variant="text"
        size="x-small"
        @click="$emit('clear-completed')"
      >
        清除已完成
      </v-btn>
    </div>
    
    <div class="queue-list">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="queue-item"
        :class="task.status"
      >
        <div class="item-icon">
          <v-progress-circular
            v-if="task.status === 'uploading'"
            :model-value="task.progress"
            size="24"
            width="2"
            color="primary"
          />
          <v-icon v-else-if="task.status === 'completed'" color="success" size="24">
            mdi-check-circle
          </v-icon>
          <v-icon v-else-if="task.status === 'failed'" color="error" size="24">
            mdi-alert-circle
          </v-icon>
          <v-icon v-else size="24">mdi-file</v-icon>
        </div>
        
        <div class="item-info">
          <span class="item-name">{{ task.file.name }}</span>
          <UploadProgress
            v-if="task.status === 'uploading'"
            :progress="task.progress"
          />
          <span v-else-if="task.status === 'failed'" class="error-msg">
            {{ task.error || '上传失败' }}
          </span>
          <span v-else-if="task.status === 'completed'" class="success-msg">
            上传完成
          </span>
          <span v-else class="pending-msg">
            等待上传 · {{ formatSize(task.file.size) }}
            <v-chip v-if="task.isChunked" size="x-small" color="info" class="ml-1">
              分片
            </v-chip>
          </span>
        </div>
        
        <v-btn
          v-if="task.status === 'completed' || task.status === 'failed'"
          icon="mdi-close"
          variant="text"
          size="small"
          @click="$emit('remove', task.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadTask } from '@/types/file'
import { formatFileSize } from '@/types/file'
import UploadProgress from './UploadProgress.vue'

defineProps<{
  tasks: UploadTask[]
}>()

defineEmits<{
  'clear-completed': []
  'remove': [id: string]
}>()

function formatSize(bytes: number): string {
  return formatFileSize(bytes)
}
</script>

<style scoped>
.upload-queue {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.02);
}

.queue-header .title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 12px;
}

.queue-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pending-msg,
.success-msg,
.error-msg {
  font-size: 11px;
}

.pending-msg {
  color: rgba(0, 0, 0, 0.5);
}

.success-msg {
  color: rgb(46, 125, 50);
}

.error-msg {
  color: rgb(211, 47, 47);
}

.v-theme--dark .upload-queue {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .queue-header {
  background-color: rgba(255, 255, 255, 0.02);
}

.v-theme--dark .queue-header .title {
  color: rgba(255, 255, 255, 0.6);
}

.v-theme--dark .queue-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.v-theme--dark .pending-msg {
  color: rgba(255, 255, 255, 0.5);
}
</style>
