<template>
  <v-app>
    <router-view />
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useTheme } from "vuetify";
import AppSnackbar from "@/components/common/AppSnackbar.vue";

const THEME_KEY = "app-theme";

onMounted(() => {
  const theme = useTheme();
  const saved = localStorage.getItem(THEME_KEY);
  if (saved && (saved === "light" || saved === "dark")) {
    theme.global.name.value = saved;
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    theme.global.name.value = prefersDark ? "dark" : "light";
  }
});
</script>

<style>
html,
body {
  overflow: hidden !important;
  height: 100vh !important;
  margin: 0;
  padding: 0;
}

.v-application {
  height: 100vh;
}

.v-application__wrap {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden !important;
}

.v-layout {
  overflow: hidden !important;
}

.v-main {
  overflow: hidden !important;
}

.v-main > .v-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.v-theme--dark .v-navigation-drawer {
  border-right-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
