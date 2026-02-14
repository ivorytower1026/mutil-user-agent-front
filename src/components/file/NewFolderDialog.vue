<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card>
      <v-card-title>新建文件夹</v-card-title>
      
      <v-card-text>
        <v-text-field
          v-model="folderName"
          label="文件夹名称"
          variant="outlined"
          density="compact"
          autofocus
          :rules="[validateName]"
          @keyup.enter="handleCreate"
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
          @click="handleCreate"
        >
          创建
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'create': [name: string]
}>()

const folderName = ref('')

const isValid = computed(() => {
  return folderName.value.trim() !== '' && !folderName.value.includes('/')
})

function validateName(value: string): boolean | string {
  if (!value.trim()) return '请输入文件夹名称'
  if (value.includes('/')) return '名称不能包含 /'
  return true
}

function handleCreate() {
  if (isValid.value) {
    emit('create', folderName.value.trim())
    folderName.value = ''
    emit('update:model-value', false)
  }
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    folderName.value = ''
  }
})
</script>
