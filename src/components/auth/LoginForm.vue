<template>
  <v-form ref="formRef" v-model="isValid" @submit.prevent="handleSubmit">
    <v-text-field
      v-model="formData.username"
      label="用户名"
      prepend-inner-icon="mdi-account"
      :rules="[rules.required]"
      variant="outlined"
      class="mb-3"
    />
    <v-text-field
      v-model="formData.password"
      label="密码"
      prepend-inner-icon="mdi-lock"
      :rules="[rules.required]"
      :type="showPassword ? 'text' : 'password'"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      variant="outlined"
      class="mb-3"
      @click:append-inner="showPassword = !showPassword"
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
      登录
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
  success: []
}>()

const { login } = useAuth()

const formRef = ref()
const isValid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  required: (v: string) => !!v || '此字段必填'
}

async function handleSubmit() {
  if (!isValid.value) return
  
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
