<template>
  <v-btn
    icon
    variant="text"
    @click="toggleTheme"
  >
    <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    <v-tooltip activator="parent">
      {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { useAppTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useAppTheme()
</script>
