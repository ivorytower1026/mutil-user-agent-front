<template>
  <v-card>
    <v-card-title class="text-subtitle-1">评分详情</v-card-title>
    <v-card-text>
      <div class="text-center mb-4">
        <v-progress-circular
          :model-value="skill.validation_score ?? 0"
          :color="scoreColor"
          size="80"
          width="8"
        >
          <span class="text-h6">{{ (skill.validation_score ?? 0).toFixed(1) }}</span>
        </v-progress-circular>
        <div class="text-caption mt-2 text-medium-emphasis">总分</div>
      </div>

      <v-list density="compact">
        <v-list-item v-if="skill.completion_score != null">
          <template #prepend>
            <v-icon size="small">mdi-check-circle</v-icon>
          </template>
          <v-list-item-title>任务完成度</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ skill.completion_score }}/100
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="skill.trigger_accuracy_score != null">
          <template #prepend>
            <v-icon size="small">mdi-target</v-icon>
          </template>
          <v-list-item-title>触发准确性</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ skill.trigger_accuracy_score }}/100
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="skill.offline_capability_score != null">
          <template #prepend>
            <v-icon size="small">mdi-wifi-off</v-icon>
          </template>
          <v-list-item-title>离线能力</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ skill.offline_capability_score }}/100
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="skill.resource_efficiency_score != null">
          <template #prepend>
            <v-icon size="small">mdi-speedometer</v-icon>
          </template>
          <v-list-item-title>资源效率</v-list-item-title>
          <v-list-item-subtitle class="text-right">
            {{ skill.resource_efficiency_score }}/100
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillDetail } from '@/types/admin'

const props = defineProps<{
  skill: SkillDetail
}>()

const scoreColor = computed(() => {
  const score = props.skill.validation_score ?? 0
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
})
</script>
