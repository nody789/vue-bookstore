<script setup lang="ts">
// LoginPage — 登入 / 註冊頁面，Tab 切換兩種模式
// 登入成功後讀取 route.query.redirect，跳回原本要去的頁面（無則回首頁）
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores/auth'

useHead({ title: '登入 / 註冊 — Vue Bookstore' })

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// tab：切換時清空 error 和 formErrors，避免顯示不對應的錯誤訊息
const tab = ref<'login' | 'register'>('login')
const loading = ref(false)
const error = ref('')

// formErrors：前端驗證的欄位錯誤，獨立於後端回傳的 error，讓錯誤顯示在對應欄位下方
const formErrors = ref<Record<string, string>>({})

// switchTab：切換 tab 同時清空所有錯誤狀態
const switchTab = (newTab: 'login' | 'register') => {
  tab.value = newTab
  error.value = ''
  formErrors.value = {}
}

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ email: '', password: '', name: '' })

// validate：前端驗證，按下送出前先檢查，不符合就顯示紅字，不送 API
// 好處：不需要等網路回應，使用者立即看到錯誤；後端 Zod 仍是最後防線
const validate = () => {
  formErrors.value = {}
  if (tab.value === 'login') {
    if (!loginForm.value.email.trim()) {
      formErrors.value['email'] = 'Email 不可為空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.email)) {
      formErrors.value['email'] = 'Email 格式不正確'
    }
    if (!loginForm.value.password) {
      formErrors.value['password'] = '密碼不可為空'
    }
  } else {
    if (!registerForm.value.name.trim()) {
      formErrors.value['name'] = '姓名不可為空'
    }
    if (!registerForm.value.email.trim()) {
      formErrors.value['email'] = 'Email 不可為空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email)) {
      formErrors.value['email'] = 'Email 格式不正確'
    }
    if (!registerForm.value.password) {
      formErrors.value['password'] = '密碼不可為空'
    } else if (registerForm.value.password.length < 8) {
      formErrors.value['password'] = '密碼至少 8 個字元'
    }
  }
  return Object.keys(formErrors.value).length === 0
}

const handleLogin = async () => {
  error.value = ''
  if (!validate()) return   // 前端驗證不通過，不送 API
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
  if (!validate()) return   // 前端驗證不通過，不送 API
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
      <button @click="switchTab('login')"
        :class="['px-6 py-3 text-sm font-medium border-b-2 transition',
          tab === 'login'
            ? 'border-amber-700 text-amber-700 dark:text-amber-500 dark:border-amber-500'
            : 'border-transparent text-stone-500 dark:text-gray-400 hover:text-stone-700 dark:hover:text-gray-200']">
        登入
      </button>
      <button @click="switchTab('register')"
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
        <input v-model="loginForm.email" type="email" autocomplete="email"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
          :class="formErrors['email'] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'" />
        <p v-if="formErrors['email']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ formErrors['email'] }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">密碼</label>
        <input v-model="loginForm.password" type="password" autocomplete="current-password"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
          :class="formErrors['password'] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'" />
        <p v-if="formErrors['password']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ formErrors['password'] }}</p>
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
        <input v-model="registerForm.name" type="text"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
          :class="formErrors['name'] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'" />
        <p v-if="formErrors['name']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ formErrors['name'] }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">Email</label>
        <input v-model="registerForm.email" type="email" autocomplete="email"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
          :class="formErrors['email'] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'" />
        <p v-if="formErrors['email']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ formErrors['email'] }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">密碼（至少 8 個字元）</label>
        <input v-model="registerForm.password" type="password" autocomplete="new-password"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
          :class="formErrors['password'] ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'" />
        <p v-if="formErrors['password']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ formErrors['password'] }}</p>
      </div>
      <button type="submit" :disabled="loading"
        class="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
        {{ loading ? '處理中...' : '建立帳號' }}
      </button>
    </form>
  </div>
</template>
