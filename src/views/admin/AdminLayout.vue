<template>
  <v-layout class="admin-layout rounded rounded-md">
    <v-navigation-drawer permanent>
      <v-list nav>
        <v-list-item prepend-icon="mdi-arrow-left" title="返回主页" to="/" />
        <v-divider class="my-2" />
        <v-list-subheader>配置管理</v-list-subheader>
        <v-list-item
          to="/admin/skills"
          prepend-icon="mdi-puzzle"
          title="Skill 管理"
          value="skills"
        />
        <v-list-item
          disabled
          prepend-icon="mdi-robot"
          title="模型配置"
          subtitle="即将上线"
        />
        <v-list-item
          disabled
          prepend-icon="mdi-connection"
          title="MCP 配置"
          subtitle="即将上线"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-surface-light">
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
</style>
