<script setup lang="ts">
// LoginPage — 登入 / 註冊頁面，Tab 切換兩種模式
// 登入成功後讀取 route.query.redirect，跳回原本要去的頁面（無則回首頁）
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// tab：切換時清空 error，避免顯示不對應的錯誤訊息
const tab = ref<'login' | 'register'>('login')
const loading = ref(false)
const error = ref('')

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ email: '', password: '', name: '' })

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(loginForm.value.email, loginForm.value.password)
    // 有 redirect query 則跳回原頁，否則回首頁
    const redirect = route.query['redirect'] as string || '/'
    router.push(redirect)
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '登入失敗'
  } finally {
    loading.value = false
  }
}

// 註冊成功後端直接回傳 token，auth store 自動儲存登入狀態
const handleRegister = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.register(registerForm.value.email, registerForm.value.password, registerForm.value.name)
    router.push('/')
  } catch (err: unknown) {
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '註冊失敗'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <h1 class="font-bold text-2xl text-stone-800 dark:text-gray-100 text-center mb-6">
      {{ tab === 'login' ? '登入' : '建立帳號' }}
    </h1>

    <!-- Tab 切換 -->
    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      <button @click="tab = 'login'; error = ''"
        :class="['px-6 py-3 text-sm font-medium border-b-2 transition',
          tab === 'login'
            ? 'border-amber-700 text-amber-700 dark:text-amber-500 dark:border-amber-500'
            : 'border-transparent text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200']">
        登入
      </button>
      <button @click="tab = 'register'; error = ''"
        :class="['px-6 py-3 text-sm font-medium border-b-2 transition',
          tab === 'register'
            ? 'border-amber-700 text-amber-700 dark:text-amber-500 dark:border-amber-500'
            : 'border-transparent text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200']">
        註冊
      </button>
    </div>

    <p v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
      {{ error }}
    </p>

    <!-- 登入表單 -->
    <form v-if="tab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">Email</label>
        <input v-model="loginForm.email" type="email" required autocomplete="email"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">密碼</label>
        <input v-model="loginForm.password" type="password" required autocomplete="current-password"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100" />
      </div>
      <button type="submit" :disabled="loading"
        class="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
        {{ loading ? '登入中...' : '登入' }}
      </button>
    </form>

    <!-- 註冊表單 -->
    <form v-else @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">姓名</label>
        <input v-model="registerForm.name" type="text" required
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">Email</label>
        <input v-model="registerForm.email" type="email" required autocomplete="email"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100" />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">密碼（至少 8 個字元）</label>
        <input v-model="registerForm.password" type="password" required minlength="8" autocomplete="new-password"
          class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100" />
      </div>
      <button type="submit" :disabled="loading"
        class="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
        {{ loading ? '處理中...' : '建立帳號' }}
      </button>
    </form>
  </div>
</template>
