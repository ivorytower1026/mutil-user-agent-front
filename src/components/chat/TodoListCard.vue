<template>
  <div class="todo-list-card">
    <div class="todo-header">
      <v-icon color="primary" size="18">mdi-clipboard-list-outline</v-icon>
      <span class="todo-title">任务计划</span>
      <span class="todo-count">{{ completedCount }}/{{ todos.length }}</span>
    </div>
    <div class="todo-items">
      <div
        v-for="(todo, index) in todos"
        :key="index"
        class="todo-item"
        :class="todo.status"
      >
        <v-icon :color="getStatusColor(todo.status)" size="16">
          {{ getStatusIcon(todo.status) }}
        </v-icon>
        <span class="todo-content">{{ todo.content }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Todo } from '@/types/chat'

const props = defineProps<{
  todos: Todo[]
}>()

const completedCount = computed(() => 
  props.todos.filter(t => t.status === 'completed').length
)

function getStatusColor(status: Todo['status']) {
  switch (status) {
    case 'in_progress': return 'warning'
    case 'completed': return 'success'
    default: return 'grey'
  }
}

function getStatusIcon(status: Todo['status']) {
  switch (status) {
    case 'in_progress': return 'mdi-loading mdi-spin'
    case 'completed': return 'mdi-check-circle'
    default: return 'mdi-circle-outline'
  }
}
</script>

<style scoped>
.todo-list-card {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-top: 8px;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.todo-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.todo-count {
  margin-left: auto;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.todo-items {
  padding: 8px 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
}

.todo-item.completed .todo-content {
  text-decoration: line-through;
  color: rgba(0, 0, 0, 0.4);
}

.todo-item.in_progress .todo-content {
  color: rgba(0, 0, 0, 0.9);
  font-weight: 500;
}

.v-theme--dark .todo-list-card {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .todo-header {
  border-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .todo-title {
  color: rgba(255, 255, 255, 0.8);
}

.v-theme--dark .todo-count {
  color: rgba(255, 255, 255, 0.5);
}

.v-theme--dark .todo-item {
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .todo-item.completed .todo-content {
  color: rgba(255, 255, 255, 0.4);
}

.v-theme--dark .todo-item.in_progress .todo-content {
  color: rgba(255, 255, 255, 0.9);
}
</style>
