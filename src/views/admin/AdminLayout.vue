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
          to="/admin/simple-skills"
          prepend-icon="mdi-upload"
          title="Skill 快速上传"
          value="simple-skills"
        />
        <v-list-item
          to="/admin/mcp"
          prepend-icon="mdi-connection"
          title="MCP 配置"
          value="mcp"
        />
        <v-list-item
          to="/admin/agents"
          prepend-icon="mdi-robot"
          title="代理配置"
          value="agents"
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
