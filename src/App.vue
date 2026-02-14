<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
</script>

<style>
html, body {
  overflow: hidden;
  height: 100vh;
}

.v-application {
  height: 100vh;
}

.v-application__wrap {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}
</style>
