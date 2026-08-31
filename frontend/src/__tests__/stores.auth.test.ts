// auth store 測試
// 【測試重點】登入成功 → state 更新 + localStorage 寫入；登出 → state 清空 + localStorage 移除
// 【為什麼要測 store】store 是全域共享的狀態，邏輯錯誤會影響所有頁面（路由守衛、Navbar、購物車）
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// mock axios：讓測試不需要真實後端
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

import axios from 'axios'
const mockAxios = vi.mocked(axios)

describe('useAuthStore', () => {
  beforeEach(() => {
    // 每個測試前重建 pinia，避免 state 互相污染
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── 初始狀態 ────────────────────────────────────────────────────────

  it('初始狀態：未登入、無 token', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.isAdmin).toBe(false)
  })

  it('localStorage 有 token + user → 重整後恢復登入狀態', () => {
    // 模擬重整前已登入的情況
    const mockUser = { id: '1', email: 'test@test.com', name: '測試', role: 'USER' as const }
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify(mockUser))

    // 重新建立 store（模擬重整後讀 localStorage）
    setActivePinia(createPinia())
    const auth = useAuthStore()

    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.email).toBe('test@test.com')
  })

  // ── 登入 ────────────────────────────────────────────────────────────

  it('login 成功 → user / token 寫入 state 和 localStorage', async () => {
    const mockUser = { id: '1', email: 'user@test.com', name: '王小明', role: 'USER' as const }
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { user: mockUser, token: 'jwt-token' } },
    })

    const auth = useAuthStore()
    await auth.login('user@test.com', 'password123')

    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.name).toBe('王小明')
    expect(auth.token).toBe('jwt-token')
    expect(localStorage.getItem('token')).toBe('jwt-token')
    expect(JSON.parse(localStorage.getItem('user')!).email).toBe('user@test.com')
  })

  it('login 後 isAdmin：一般用戶回傳 false', async () => {
    const mockUser = { id: '1', email: 'user@test.com', name: '王小明', role: 'USER' as const }
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { user: mockUser, token: 'jwt-token' } },
    })

    const auth = useAuthStore()
    await auth.login('user@test.com', 'password123')

    expect(auth.isAdmin).toBe(false)
  })

  it('login 後 isAdmin：管理員帳號回傳 true', async () => {
    const mockAdmin = { id: '2', email: 'admin@test.com', name: '管理員', role: 'ADMIN' as const }
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { user: mockAdmin, token: 'admin-token' } },
    })

    const auth = useAuthStore()
    await auth.login('admin@test.com', 'admin1234')

    expect(auth.isAdmin).toBe(true)
  })

  it('login 失敗 → 拋出錯誤，state 不變', async () => {
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('帳號或密碼錯誤')
    )

    const auth = useAuthStore()
    await expect(auth.login('wrong@test.com', 'wrong')).rejects.toThrow()

    expect(auth.isLoggedIn).toBe(false)
    expect(auth.user).toBeNull()
  })

  // ── 登出 ────────────────────────────────────────────────────────────

  it('logout → 清空 state 和 localStorage', async () => {
    const mockUser = { id: '1', email: 'user@test.com', name: '王小明', role: 'USER' as const }
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { user: mockUser, token: 'jwt-token' } },
    })

    const auth = useAuthStore()
    await auth.login('user@test.com', 'password123')

    auth.logout()

    expect(auth.isLoggedIn).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  // ── updateUser ───────────────────────────────────────────────────────

  it('updateUser → 更新 name 並同步 localStorage', async () => {
    const mockUser = { id: '1', email: 'user@test.com', name: '舊名字', role: 'USER' as const }
    ;(mockAxios.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: { user: mockUser, token: 'jwt-token' } },
    })

    const auth = useAuthStore()
    await auth.login('user@test.com', 'password123')
    auth.updateUser({ name: '新名字' })

    expect(auth.user?.name).toBe('新名字')
    expect(JSON.parse(localStorage.getItem('user')!).name).toBe('新名字')
  })
})
