<template>
  <v-snackbar
    v-model="show"
    :color="color"
    :timeout="2000"
    location="top center"
    @update:model-value="show = $event"
  >
    {{ message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotification } from '@/stores/notification'

const { show, message, color } = useNotification()
</script>
