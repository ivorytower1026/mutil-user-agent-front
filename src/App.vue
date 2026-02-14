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
  margin: 0;
  padding: 0;
}

.v-application {
  height: 100vh;
}

.v-application__wrap {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.v-theme--dark .v-navigation-drawer {
  border-right-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
