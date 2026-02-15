<template>
  <div class="interrupt-detail">
    <div class="interrupt-header">
      <div class="interrupt-info">{{ interrupt.info }}</div>
      <v-chip
        v-if="interrupt.taskName && interrupt.taskName !== 'Unknown'"
        size="small"
        color="primary"
        variant="flat"
      >
        {{ interrupt.taskName }}
      </v-chip>
    </div>
    
    <div class="options-list">
      <div
        v-for="option in displayOptions"
        :key="option.id"
        class="option-card"
        :class="{ selected: modelValue === option.id }"
        @click="$emit('update:modelValue', option.id)"
      >
        <v-icon v-if="option.icon" size="18" class="option-icon">
          {{ option.icon }}
        </v-icon>
        <div class="option-content">
          <div class="option-label">{{ option.label }}</div>
          <div v-if="option.description" class="option-desc">
            {{ option.description }}
          </div>
        </div>
        <v-icon v-if="modelValue === option.id" size="18" color="primary" class="check-icon">
          mdi-check-circle
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Interrupt, InterruptOption } from '@/types/chat'

const props = defineProps<{
  interrupt: Interrupt
  modelValue?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const defaultOptions: InterruptOption[] = [
  {
    id: 'continue',
    label: '继续执行',
    description: '按原计划继续执行任务',
    icon: 'mdi-play'
  },
  {
    id: 'cancel',
    label: '取消执行',
    description: '终止当前任务并返回',
    icon: 'mdi-stop'
  }
]

const displayOptions = computed(() => {
  return props.interrupt.options?.length ? props.interrupt.options : defaultOptions
})
</script>

<style scoped>
.interrupt-detail {
  width: 100%;
}

.interrupt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.interrupt-info {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  flex: 1;
  min-width: 200px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-card:hover {
  border-color: rgba(0, 0, 0, 0.15);
  background-color: rgba(0, 0, 0, 0.05);
}

.option-card.selected {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.08);
}

.option-icon {
  opacity: 0.6;
  flex-shrink: 0;
}

.option-card.selected .option-icon {
  opacity: 1;
  color: #2196F3;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-label {
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

.option-desc {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}

.check-icon {
  flex-shrink: 0;
}

.v-theme--dark .interrupt-info {
  color: rgba(255, 255, 255, 0.85);
}

.v-theme--dark .option-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .option-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .option-card.selected {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.15);
}

.v-theme--dark .option-label {
  color: rgba(255, 255, 255, 0.95);
}

.v-theme--dark .option-desc {
  color: rgba(255, 255, 255, 0.5);
}
</style>
