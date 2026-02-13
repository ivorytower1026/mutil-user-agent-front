<template>
  <v-container fluid class="fill-height bg-surface">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" lg="3">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title class="text-center">
              <v-icon class="mr-2">mdi-robot</v-icon>
              AI Agent Platform
            </v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-tabs v-model="activeTab" grow class="mb-4">
              <v-tab value="login">登录</v-tab>
              <v-tab value="register">注册</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item value="login">
                <LoginForm @success="handleLoginSuccess" />
              </v-window-item>
              
              <v-window-item value="register">
                <RegisterForm 
                  @success="handleRegisterSuccess" 
                  @switch-to-login="activeTab = 'login'"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const activeTab = ref('login')

function handleLoginSuccess() {
  router.push('/')
}

function handleRegisterSuccess() {
  activeTab.value = 'login'
}
</script>
