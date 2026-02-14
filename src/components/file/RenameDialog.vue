<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card>
      <v-card-title>重命名</v-card-title>
      
      <v-card-text>
        <v-text-field
          v-model="newName"
          label="新名称"
          variant="outlined"
          density="compact"
          autofocus
          :rules="[validateName]"
          @keyup.enter="handleRename"
        />
      </v-card-text>
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="$emit('update:model-value', false)"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!isValid"
          @click="handleRename"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  currentName?: string
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'rename': [newName: string]
}>()

const newName = ref('')

const isValid = computed(() => {
  return newName.value.trim() !== '' && 
         !newName.value.includes('/') &&
         newName.value !== props.currentName
})

function validateName(value: string): boolean | string {
  if (!value.trim()) return '请输入名称'
  if (value.includes('/')) return '名称不能包含 /'
  return true
}

function handleRename() {
  if (isValid.value) {
    emit('rename', newName.value.trim())
    emit('update:model-value', false)
  }
}

watch(() => props.modelValue, (val) => {
  if (val && props.currentName) {
    newName.value = props.currentName
  }
})
</script>
