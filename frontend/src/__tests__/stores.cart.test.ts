// cart store 測試
// 【測試重點】computed（itemCount / total）計算正確；操作後 items 狀態正確
// 【為什麼測 computed】itemCount 顯示在 Navbar badge，total 用於結帳頁，算錯會直接影響用戶
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'

// mock api 模組，避免測試打真實後端
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/lib/api'
const mockApi = vi.mocked(api)

// 假書籍資料，符合 CartItem['book'] 的型別
const makeBook = (id: string, price: number, stock = 10) => ({
  id,
  title: `書籍 ${id}`,
  author: '作者',
  price,
  stock,
  coverImageUrl: null,
})

describe('useCartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── 初始狀態 ─────────────────────────────────────────────────────────

  it('初始狀態：空購物車、0 件、NT$0', () => {
    const cart = useCartStore()
    expect(cart.items).toEqual([])
    expect(cart.itemCount).toBe(0)
    expect(cart.total).toBe(0)
  })

  // ── computed：itemCount ───────────────────────────────────────────────

  it('itemCount = 各商品數量加總', () => {
    const cart = useCartStore()
    cart.items = [
      { id: 'i1', bookId: 'b1', quantity: 2, book: makeBook('b1', 300) },
      { id: 'i2', bookId: 'b2', quantity: 3, book: makeBook('b2', 500) },
    ]
    // 2 + 3 = 5 件
    expect(cart.itemCount).toBe(5)
  })

  it('itemCount：單件商品', () => {
    const cart = useCartStore()
    cart.items = [
      { id: 'i1', bookId: 'b1', quantity: 1, book: makeBook('b1', 300) },
    ]
    expect(cart.itemCount).toBe(1)
  })

  // ── computed：total ───────────────────────────────────────────────────

  it('total = 單價 × 數量的加總', () => {
    const cart = useCartStore()
    cart.items = [
      { id: 'i1', bookId: 'b1', quantity: 2, book: makeBook('b1', 300) }, // 600
      { id: 'i2', bookId: 'b2', quantity: 1, book: makeBook('b2', 500) }, // 500
    ]
    // 600 + 500 = 1100
    expect(cart.total).toBe(1100)
  })

  it('total：購物車空時為 0', () => {
    const cart = useCartStore()
    expect(cart.total).toBe(0)
  })

  // ── fetchCart ─────────────────────────────────────────────────────────

  it('fetchCart → 呼叫 API 並更新 items', async () => {
    const mockItems = [
      { id: 'i1', bookId: 'b1', quantity: 1, book: makeBook('b1', 300) },
    ]
    mockApi.get.mockResolvedValueOnce({ data: { data: mockItems } })

    const cart = useCartStore()
    await cart.fetchCart()

    expect(mockApi.get).toHaveBeenCalledWith('/cart')
    expect(cart.items).toEqual(mockItems)
  })

  it('fetchCart 期間 loading = true，結束後 = false', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: [] } })

    const cart = useCartStore()
    const fetchPromise = cart.fetchCart()
    expect(cart.loading).toBe(true)

    await fetchPromise
    expect(cart.loading).toBe(false)
  })

  // ── removeItem ────────────────────────────────────────────────────────

  it('removeItem → 樂觀更新：不等 API 回應就從 items 移除', async () => {
    mockApi.delete.mockResolvedValueOnce({})

    const cart = useCartStore()
    cart.items = [
      { id: 'i1', bookId: 'b1', quantity: 1, book: makeBook('b1', 300) },
      { id: 'i2', bookId: 'b2', quantity: 2, book: makeBook('b2', 500) },
    ]

    await cart.removeItem('i1')

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.id).toBe('i2')
    expect(mockApi.delete).toHaveBeenCalledWith('/cart/items/i1')
  })

  // ── clearLocal ────────────────────────────────────────────────────────

  it('clearLocal → 清空 items（登出時用）', () => {
    const cart = useCartStore()
    cart.items = [
      { id: 'i1', bookId: 'b1', quantity: 1, book: makeBook('b1', 300) },
    ]

    cart.clearLocal()

    expect(cart.items).toEqual([])
  })
})
