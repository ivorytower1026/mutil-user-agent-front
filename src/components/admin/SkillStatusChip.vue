<template>
  <v-chip :color="color" size="small" variant="flat">
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillStatus, ValidationStage } from '@/types/admin'

const props = defineProps<{
  status: SkillStatus
  stage: ValidationStage
}>()

const { color, label } = computed(() => {
  if (props.status === 'validating') {
    return { color: 'info', label: '验证中' }
  }
  if (props.status === 'approved') {
    return { color: 'success', label: '已批准' }
  }
  if (props.status === 'rejected') {
    return { color: 'error', label: '已拒绝' }
  }
  if (props.status === 'rollback_pending') {
    return { color: 'warning', label: '回滚待处理' }
  }
  if (props.stage === 'completed') {
    return { color: 'warning', label: '待审核' }
  }
  if (props.stage === 'failed') {
    return { color: 'error', label: '验证失败' }
  }
  if (props.stage === 'layer1') {
    return { color: 'info', label: '第一层验证' }
  }
  if (props.stage === 'layer2') {
    return { color: 'info', label: '第二层验证' }
  }
  return { color: 'default', label: '待验证' }
}).value
</script>
