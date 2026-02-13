<template>
  <div class="chat-input">
    <v-textarea
      v-model="inputText"
      :placeholder="placeholder"
      :disabled="disabled"
      auto-grow
      max-rows="6"
      variant="outlined"
      hide-details
      @keydown.enter.exact.prevent="handleSend"
      @keydown.enter.shift.exact="inputText += '\n'"
    />
    <v-btn
      color="primary"
      :disabled="disabled || !inputText.trim()"
      icon
      class="send-btn"
      @click="handleSend"
    >
      <v-icon>mdi-send</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
  placeholder: '输入消息... (Enter发送, Shift+Enter换行)'
})

const emit = defineEmits<{
  send: [message: string]
}>()

const inputText = ref('')

function handleSend() {
  const message = inputText.value.trim()
  if (message && !props.disabled) {
    emit('send', message)
    inputText.value = ''
  }
}
</script>

<style scoped>
.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.chat-input :deep(.v-textarea) {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
  margin-bottom: 4px;
}

.v-theme--dark .chat-input {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>
