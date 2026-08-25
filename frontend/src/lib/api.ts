// lib/api.ts — 封裝的 Axios 實例，統一自動帶 JWT token，401 時自動登出
// 在攔截器內才取 useAuthStore()，確保 Pinia 已初始化（不在模組頂層呼叫）
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// 開發：Vite proxy 把 /api/v1 轉發到 localhost:8000（vite.config.ts 設定）
// 正式環境：前後端同一個 Render 服務，直接用相對路徑 /api/v1 即可
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// 請求攔截器：每次送出前自動注入 Bearer token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// 回應攔截器：401 代表 token 過期，強制登出並跳轉登入頁
// 用 window.location.href 而非 router.push，避免循環依賴
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
