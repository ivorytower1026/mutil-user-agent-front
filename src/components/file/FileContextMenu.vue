<template>
  <v-menu
    v-model="show"
    :target="target"
    location="bottom start"
    :close-on-content-click="true"
  >
    <v-list density="compact">
      <v-list-item
        v-if="item?.type === 'file'"
        prepend-icon="mdi-download"
        @click="handleDownload"
      >
        <v-list-item-title>下载</v-list-item-title>
      </v-list-item>
      
      <v-list-item
        v-if="item?.type === 'file'"
        prepend-icon="mdi-eye"
        @click="handlePreview"
      >
        <v-list-item-title>预览</v-list-item-title>
      </v-list-item>
      
      <v-list-item
        prepend-icon="mdi-pencil"
        @click="handleRename"
      >
        <v-list-item-title>重命名</v-list-item-title>
      </v-list-item>
      
      <v-divider />
      
      <v-list-item
        prepend-icon="mdi-delete"
        base-color="error"
        @click="handleDelete"
      >
        <v-list-item-title>删除</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FileItem } from '@/types/file'

const props = defineProps<{
  modelValue: boolean
  item: FileItem | null
  target: [number, number] | undefined
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'download': [item: FileItem]
  'preview': [item: FileItem]
  'rename': [item: FileItem]
  'delete': [item: FileItem]
}>()

const show = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  show.value = val
})

watch(show, (val) => {
  emit('update:model-value', val)
})

function handleDownload() {
  if (props.item) emit('download', props.item)
}

function handlePreview() {
  if (props.item) emit('preview', props.item)
}

function handleRename() {
  if (props.item) emit('rename', props.item)
}

function handleDelete() {
  if (props.item) emit('delete', props.item)
}
</script>
