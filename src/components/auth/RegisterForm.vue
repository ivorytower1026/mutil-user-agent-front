<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-text-field
      v-model="formData.username"
      label="用户名"
      prepend-inner-icon="mdi-account"
      :rules="[rules.required, rules.minLength]"
      variant="outlined"
      class="mb-3"
    />
    <v-text-field
      v-model="formData.password"
      label="密码"
      prepend-inner-icon="mdi-lock"
      :rules="[rules.required, rules.passwordMinLength]"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      variant="outlined"
      class="mb-3"
      @click:append-inner="showPassword = !showPassword"
    />
    <v-text-field
      v-model="formData.confirmPassword"
      label="确认密码"
      prepend-inner-icon="mdi-lock-check"
      :rules="[rules.required, rules.passwordMatch]"
      :type="showConfirmPassword ? 'text' : 'password'"
      :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
      variant="outlined"
      class="mb-3"
      @click:append-inner="showConfirmPassword = !showConfirmPassword"
    />
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-3"
      closable
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>
    <v-btn
      type="submit"
      color="primary"
      block
      size="large"
      :loading="loading"
      :disabled="!isValid"
    >
      注册
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
  success: []
  switchToLogin: []
}>()

const { register } = useAuth()

const formRef = ref()
const isValid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: (v: string) => !!v || '此字段必填',
  minLength: (v: string) => v.length >= 3 || '用户名至少3个字符',
  passwordMinLength: (v: string) => v.length >= 6 || '密码至少6个字符',
  passwordMatch: (v: string) => v === formData.password || '两次密码不一致'
}

async function handleSubmit() {
  if (!isValid.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    await register({
      username: formData.username,
      password: formData.password
    })
    emit('success')
  } catch (e: unknown) {
    if (e instanceof Error) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = '注册失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>
