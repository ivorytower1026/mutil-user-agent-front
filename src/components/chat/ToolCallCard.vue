<template>
  <div v-if="isWriteTodos && toolCall.todos" class="tool-call-card">
    <TodoListCard :todos="toolCall.todos" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ToolCall } from '@/types/chat'
import TodoListCard from './TodoListCard.vue'

const props = defineProps<{
  toolCall: ToolCall
}>()

const isWriteTodos = computed(() => props.toolCall.name === 'write_todos')
</script>

<style scoped>
.tool-call-card {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 8px;
}

.v-theme--dark .tool-call-card {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
