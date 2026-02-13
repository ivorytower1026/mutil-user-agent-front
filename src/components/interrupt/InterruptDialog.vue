<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        需要人工确认
      </v-card-title>
      
      <v-divider />
      
      <v-card-text>
        <InterruptDetail v-if="interrupt" :interrupt="interrupt" />
        <v-alert v-else type="info" variant="tonal">
          等待中断信息...
        </v-alert>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          color="error"
          variant="outlined"
          :disabled="loading"
          @click="handleCancel"
        >
          <v-icon start>mdi-close</v-icon>
          取消执行
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="handleContinue"
        >
          <v-icon start>mdi-check</v-icon>
          继续执行
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Interrupt } from '@/types/chat'
import InterruptDetail from './InterruptDetail.vue'

defineProps<{
  modelValue: boolean
  interrupt: Interrupt | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  continue: []
  cancel: []
}>()

function handleContinue() {
  emit('continue')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
