<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label class="form-label">用户名</label>
      <input
        v-model="formData.username"
        type="text"
        class="form-input"
        placeholder="输入用户名"
        autocomplete="username"
      />
    </div>
    
    <div class="form-group">
      <label class="form-label">密码</label>
      <div class="password-input">
        <input
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          class="form-input"
          placeholder="输入密码"
          autocomplete="current-password"
        />
        <button 
          type="button" 
          class="password-toggle"
          @click="showPassword = !showPassword"
        >
          <v-icon size="18">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
        </button>
      </div>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <button 
      type="submit" 
      class="submit-btn"
      :disabled="loading || !isFormValid"
    >
      <v-progress-circular v-if="loading" indeterminate size="18" color="white" />
      <span v-else>登录</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
  success: []
}>()

const { login } = useAuth()

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: ''
})

const isFormValid = computed(() => {
  return formData.username.trim() && formData.password.trim()
})

async function handleSubmit() {
  if (!isFormValid.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    await login({
      username: formData.username,
      password: formData.password
    })
    emit('success')
  } catch (e: unknown) {
    if (e instanceof Error) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #24292f;
}

.form-input {
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 20px;
  color: #24292f;
  background-color: #fff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input::placeholder {
  color: #8b949e;
}

.form-input:focus {
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.15);
}

.password-input {
  position: relative;
}

.password-input .form-input {
  padding-right: 36px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  color: #57606a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #24292f;
}

.error-message {
  padding: 10px 12px;
  font-size: 13px;
  color: #cf222e;
  background-color: #ffebe9;
  border: 1px solid #ff818266;
  border-radius: 6px;
}

.submit-btn {
  width: 100%;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: #10a37f;
  border: 1px solid rgba(240, 246, 252, 0.1);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  transition: background-color 0.15s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0d8a6a;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-theme--dark .form-label {
  color: #f0f6fc;
}

.v-theme--dark .form-input {
  color: #f0f6fc;
  background-color: #0d1117;
  border-color: #30363d;
}

.v-theme--dark .form-input::placeholder {
  color: #6e7681;
}

.v-theme--dark .form-input:focus {
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.2);
}

.v-theme--dark .password-toggle {
  color: #8b949e;
}

.v-theme--dark .password-toggle:hover {
  color: #f0f6fc;
}

.v-theme--dark .error-message {
  color: #ff7b72;
  background-color: rgba(248, 81, 73, 0.1);
  border-color: rgba(248, 81, 73, 0.4);
}
</style>
