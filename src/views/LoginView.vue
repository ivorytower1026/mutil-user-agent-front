<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <v-icon size="40" color="#10a37f">mdi-robot</v-icon>
        </div>
        <h1 class="title">AI Assistant</h1>
        <p class="subtitle">{{ isLogin ? '登录您的账户' : '创建新账户' }}</p>
      </div>
      
      <div class="login-card">
        <div class="form-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: isLogin }"
            @click="isLogin = true"
          >
            登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: !isLogin }"
            @click="isLogin = false"
          >
            注册
          </button>
        </div>

        <LoginForm 
          v-if="isLogin" 
          @success="handleLoginSuccess" 
        />
        <RegisterForm 
          v-else 
          @success="handleRegisterSuccess" 
        />
      </div>
      
      <p class="terms">
        登录即表示您同意我们的服务条款和隐私政策
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const isLogin = ref(true)

function handleLoginSuccess() {
  router.push('/')
}

function handleRegisterSuccess() {
  isLogin.value = true
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 320px;
}

.login-header {
  text-align: center;
  margin-bottom: 16px;
}

.logo {
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #24292f;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #57606a;
  margin: 0;
}

.login-card {
  background: #fff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 16px;
}

.form-tabs {
  display: flex;
  border-bottom: 1px solid #d0d7de;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #57606a;
  cursor: pointer;
  position: relative;
  transition: color 0.15s;
}

.tab-btn:hover {
  color: #24292f;
}

.tab-btn.active {
  color: #24292f;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #10a37f;
}

.terms {
  text-align: center;
  font-size: 12px;
  color: #57606a;
  margin-top: 16px;
}

.v-theme--dark .login-page {
  background-color: #0d1117;
}

.v-theme--dark .title {
  color: #f0f6fc;
}

.v-theme--dark .subtitle {
  color: #8b949e;
}

.v-theme--dark .login-card {
  background: #161b22;
  border-color: #30363d;
}

.v-theme--dark .form-tabs {
  border-color: #30363d;
}

.v-theme--dark .tab-btn {
  color: #8b949e;
}

.v-theme--dark .tab-btn:hover {
  color: #f0f6fc;
}

.v-theme--dark .tab-btn.active {
  color: #f0f6fc;
}

.v-theme--dark .terms {
  color: #8b949e;
}
</style>
