<template>
  <v-card variant="outlined" class="interrupt-detail">
    <v-card-text>
      <v-row dense>
        <v-col cols="12">
          <div class="text-caption text-medium-emphasis">中断信息</div>
          <div class="text-body-1 mt-1">{{ interrupt.info }}</div>
        </v-col>
        
        <v-col v-if="interrupt.taskName !== 'Unknown'" cols="12" class="mt-3">
          <div class="text-caption text-medium-emphasis">任务名称</div>
          <v-chip size="small" color="primary" variant="flat" class="mt-1">
            {{ interrupt.taskName }}
          </v-chip>
        </v-col>
        
        <v-col v-if="interrupt.data && Object.keys(interrupt.data).length > 0" cols="12" class="mt-3">
          <div class="text-caption text-medium-emphasis mb-1">详细信息</div>
          <pre class="detail-json">{{ formatJson(interrupt.data) }}</pre>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Interrupt } from '@/types/chat'

defineProps<{
  interrupt: Interrupt
}>()

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.interrupt-detail {
  background-color: rgba(255, 193, 7, 0.05);
}

.detail-json {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.85em;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.v-theme--dark .interrupt-detail {
  background-color: rgba(255, 193, 7, 0.1);
}

.v-theme--dark .detail-json {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
