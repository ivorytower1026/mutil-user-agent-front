<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-container">
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
    <p class="hint-text">按 Enter 发送，Shift + Enter 换行</p>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  placeholder: '给 AI 发送消息'
})

const emit = defineEmits<{
  send: [message: string]
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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
</script>

<style scoped>
.chat-input-wrapper {
  padding: 16px 24px 24px;
  background: transparent;
}

.chat-input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
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
