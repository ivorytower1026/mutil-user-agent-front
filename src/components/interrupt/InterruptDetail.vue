<template>
  <div class="interrupt-detail">
    <template v-if="!interrupt.questions?.length">
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
    </template>
    
    <template v-else>
      <div class="questions-list">
        <div 
          v-for="(q, qIdx) in interrupt.questions" 
          :key="qIdx" 
          class="question-item"
        >
          <div class="question-text">{{ qIdx + 1 }}. {{ q.question }}</div>
          <div class="question-options">
            <div
              v-for="opt in q.options"
              :key="opt.value"
              class="option-card compact"
              :class="{ selected: isOptionSelected(qIdx, opt) }"
              @click="selectOption(qIdx, opt)"
            >
              <span class="option-label">{{ opt.label }}</span>
            </div>
          </div>
          <v-text-field
            v-if="hasCustomInput(qIdx)"
            v-model="customInputs[qIdx]"
            density="compact"
            variant="outlined"
            placeholder="请输入您的回答..."
            hide-details
            class="custom-input"
            @update:modelValue="updateCustomAnswer(qIdx)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Interrupt, InterruptOption, Question, QuestionOption } from '@/types/chat'

const props = defineProps<{
  interrupt: Interrupt
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:answers': [value: string[]]
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

const localAnswers = ref<string[]>([])
const customInputs = ref<Record<number, string>>({})

watch(() => props.interrupt.questions, (questions) => {
  if (questions?.length) {
    localAnswers.value = new Array(questions.length).fill('')
    customInputs.value = {}
  }
}, { immediate: true })

watch(localAnswers, () => {
  emit('update:answers', [...localAnswers.value])
}, { deep: true })

function isOptionSelected(qIdx: number, opt: QuestionOption): boolean {
  const current = localAnswers.value[qIdx]
  if (opt.allow_custom) {
    const fixedValues = props.interrupt.questions![qIdx].options
      .filter(o => !o.allow_custom)
      .map(o => o.value)
    return !fixedValues.includes(current) && !!current
  }
  return current === opt.value
}

function selectOption(qIdx: number, opt: QuestionOption) {
  if (opt.allow_custom) {
    customInputs.value[qIdx] = ''
    localAnswers.value[qIdx] = '__custom__'
  } else {
    localAnswers.value[qIdx] = opt.value
  }
}

function hasCustomInput(qIdx: number): boolean {
  const q = props.interrupt.questions?.[qIdx]
  if (!q) return false
  const currentAnswer = localAnswers.value[qIdx]
  const customOpt = q.options.find(o => o.allow_custom)
  return !!customOpt && currentAnswer === '__custom__'
}

function updateCustomAnswer(qIdx: number) {
  localAnswers.value[qIdx] = customInputs.value[qIdx] || ''
}
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

.option-card.compact {
  padding: 8px 12px;
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

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.question-text {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.87);
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-input {
  margin-top: 8px;
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

.v-theme--dark .question-item {
  background-color: rgba(255, 255, 255, 0.04);
}

.v-theme--dark .question-text {
  color: rgba(255, 255, 255, 0.95);
}
</style>
