<template>
  <v-btn
    :size="size"
    :icon="true"
    variant="text"
    density="comfortable"
    @click="handleCopy"
    class="copy-button"
    :class="{ copied: isCopied }"
  >
    <v-icon :size="iconSize">
      {{ isCopied ? 'mdi-check' : 'mdi-content-copy' }}
    </v-icon>
    <v-tooltip activator="parent" location="top">
      {{ isCopied ? '已复制' : '复制' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotification } from '@/stores/notification'

const props = withDefaults(defineProps<{
  text: string
  size?: 'small' | 'medium' | 'large' | 'x-large'
}>(), {
  size: 'small'
})

const notification = useNotification()
const isCopied = ref(false)

const iconSize = computed(() => {
  const sizeMap = {
    'small': 16,
    'medium': 20,
    'large': 24,
    'x-large': 28
  }
  return sizeMap[props.size]
})

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.text)
    isCopied.value = true
    notification.success('已复制到剪贴板')
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (error) {
    notification.error('复制失败，请手动选择复制')
    console.error('Copy failed:', error)
  }
}
</script>

<style scoped>
.copy-button {
  opacity: 0.6;
  transition: opacity 0.2s, transform 0.2s;
}

.copy-button:hover {
  opacity: 1;
}

.copy-button.copied {
  opacity: 1;
  color: rgb(var(--v-theme-success));
}

.copy-button:active {
  transform: scale(0.95);
}
</style>
