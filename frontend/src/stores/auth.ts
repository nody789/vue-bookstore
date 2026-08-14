// stores/auth.ts — 登入狀態全域 Store，管理 user 和 JWT token
// 資料持久化到 localStorage（重整後可恢復登入狀態）
// 直接用原生 axios 打登入 API，避免與 api.ts 攔截器形成循環依賴
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // 初始值從 localStorage 讀取，JSON.parse('null') = null 型別正確
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))

  // token 和 user 都存在才算登入，避免資料不完整時誤判
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // 登入成功後同步存入 store 和 localStorage，失敗拋給呼叫端處理
  const login = async (email: string, password: string) => {
    const res = await axios.post('/api/v1/auth/login', { email, password })
    const { user: u, token: t } = res.data.data
    user.value = u
    token.value = t
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', t)
  }

  // 註冊成功後端直接回傳 token，邏輯與 login 相同
  const register = async (email: string, password: string, name: string) => {
    const res = await axios.post('/api/v1/auth/register', { email, password, name })
    const { user: u, token: t } = res.data.data
    user.value = u
    token.value = t
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', t)
  }

  // 清除 store 和 localStorage，App.vue 的 watch 會同步清空購物車
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, login, register, logout }
})
