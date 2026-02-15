<template>
  <div class="chat-input-wrapper">
    <div v-if="isLoading && !interrupt" class="status-bar">
      <v-progress-circular indeterminate size="16" width="2" />
      <span>AI 正在思考中...</span>
    </div>
    
    <div v-if="interrupt" class="interrupt-selector">
      <div class="interrupt-header">
        <v-icon color="warning" size="20">mdi-alert-circle-outline</v-icon>
        <span class="interrupt-title">需要人工确认</span>
      </div>
      
      <InterruptDetail
        :interrupt="interrupt"
        v-model="selectedOptionId"
      />
      
      <div class="interrupt-actions">
        <v-btn
          color="primary"
          variant="flat"
          :loading="isLoading"
          :disabled="!selectedOptionId"
          @click="handleConfirm"
        >
          <v-icon start size="18">mdi-check</v-icon>
          确认选择
        </v-btn>
      </div>
    </div>
    
    <div v-else class="chat-input-container" @click="textareaRef?.focus()">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        :placeholder="placeholder"
        :disabled="disabled"
        class="chat-textarea"
        rows="1"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <button
        class="send-btn"
        :disabled="disabled || !inputText.trim()"
        @click="handleSend"
      >
        <v-icon size="20">mdi-arrow-up</v-icon>
      </button>
    </div>
    
    <p v-if="!interrupt" class="hint-text">按 Enter 发送，Shift + Enter 换行</p>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { Interrupt } from '@/types/chat'
import InterruptDetail from '@/components/interrupt/InterruptDetail.vue'

const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
  isLoading?: boolean
  interrupt?: Interrupt | null
}>(), {
  disabled: false,
  placeholder: '给 AI 发送消息',
  isLoading: false,
  interrupt: null
})

const emit = defineEmits<{
  send: [message: string]
  resume: [action: string]
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedOptionId = ref<string>('')

watch(() => props.interrupt, (newInterrupt) => {
  if (newInterrupt?.options?.length) {
    selectedOptionId.value = newInterrupt.options[0].id
  } else {
    selectedOptionId.value = 'continue'
  }
}, { immediate: true })

function autoResize() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 200) + 'px'
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const message = inputText.value.trim()
  if (message && !props.disabled) {
    emit('send', message)
    inputText.value = ''
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })
  }
}

function handleConfirm() {
  if (selectedOptionId.value) {
    emit('resume', selectedOptionId.value)
  }
}
</script>

<style scoped>
.chat-input-wrapper {
  padding: 16px 24px 24px;
  background: transparent;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 768px;
  margin: 0 auto 12px;
  padding: 8px 16px;
  background-color: rgba(33, 150, 243, 0.08);
  border-radius: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.interrupt-selector {
  max-width: 768px;
  margin: 0 auto;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.interrupt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.interrupt-title {
  font-weight: 500;
  font-size: 15px;
}

.interrupt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: text;
  max-width: 768px;
  margin: 0 auto;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 24px;
  transition: background-color 0.2s;
}

.chat-input-container:focus-within {
  background-color: rgba(0, 0, 0, 0.06);
}

.chat-textarea {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  max-height: 200px;
  font-family: inherit;
  color: inherit;
}

.chat-textarea::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.chat-textarea:disabled {
  opacity: 0.5;
}

.send-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: #333;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background-color: #555;
}

.send-btn:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.3);
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 8px;
  margin-bottom: 0;
}

.v-theme--dark .status-bar {
  background-color: rgba(33, 150, 243, 0.12);
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .interrupt-selector {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .interrupt-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .interrupt-actions {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .chat-input-container {
  background-color: rgba(255, 255, 255, 0.06);
}

.v-theme--dark .chat-input-container:focus-within {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .chat-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .send-btn {
  background-color: #fff;
  color: #333;
}

.v-theme--dark .send-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.v-theme--dark .send-btn:disabled {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
}

.v-theme--dark .hint-text {
  color: rgba(255, 255, 255, 0.4);
}
</style>
