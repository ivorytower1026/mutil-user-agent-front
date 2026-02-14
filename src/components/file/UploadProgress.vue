<template>
  <div class="upload-progress">
    <v-progress-linear
      :model-value="progress"
      :color="color"
      height="6"
      rounded
    />
    <div class="progress-info">
      <span class="percent">{{ progress }}%</span>
      <span v-if="speed" class="speed">{{ speed }}</span>
      <span v-if="remaining" class="remaining">剩余 {{ remaining }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  speed?: string
  remaining?: string
  status?: 'uploading' | 'completed' | 'failed'
}>()

const color = computed(() => {
  if (props.status === 'completed') return 'success'
  if (props.status === 'failed') return 'error'
  return 'primary'
})
</script>

<style scoped>
.upload-progress {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}

.percent {
  font-weight: 500;
}

.v-theme--dark .progress-info {
  color: rgba(255, 255, 255, 0.6);
}
</style>
