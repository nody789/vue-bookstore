// recentlyViewed store 測試
// 【測試重點】去重邏輯、插頭順序、超過上限時刪最舊、localStorage 持久化
// 這個 store 純前端，不打 API，邏輯全部可以確定性地測試
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecentlyViewedStore } from '@/stores/recentlyViewed'
import type { Book } from '@/types'

// 建立假書籍的工具函式，只需填必要欄位
const makeBook = (id: string): Book => ({
  id,
  title: `書籍 ${id}`,
  author: '作者',
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: '文學小說' },
  publisher: null,
  isbn: null,
  description: null,
  price: 300,
  stock: 10,
  coverImageUrl: null,
  createdAt: new Date().toISOString(),
})

describe('useRecentlyViewedStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  // ── 初始狀態 ─────────────────────────────────────────────────────────

  it('初始狀態：空陣列', () => {
    const store = useRecentlyViewedStore()
    expect(store.items).toEqual([])
  })

  // ── addBook：插頭 ─────────────────────────────────────────────────────

  it('addBook → 新書加到最前面', () => {
    const store = useRecentlyViewedStore()
    store.addBook(makeBook('b1'))
    store.addBook(makeBook('b2'))

    // 最後瀏覽的 b2 排第一
    expect(store.items[0]?.id).toBe('b2')
    expect(store.items[1]?.id).toBe('b1')
  })

  // ── addBook：去重 ─────────────────────────────────────────────────────

  it('addBook 同一本書 → 移到最前，不重複', () => {
    const store = useRecentlyViewedStore()
    store.addBook(makeBook('b1'))
    store.addBook(makeBook('b2'))
    store.addBook(makeBook('b1')) // b1 再次瀏覽

    // b1 移到最前，總數仍是 2
    expect(store.items).toHaveLength(2)
    expect(store.items[0]?.id).toBe('b1')
    expect(store.items[1]?.id).toBe('b2')
  })

  // ── addBook：上限 ─────────────────────────────────────────────────────

  it('超過 8 本 → 自動移除最舊的', () => {
    const store = useRecentlyViewedStore()
    // 依序瀏覽 9 本
    for (let i = 1; i <= 9; i++) {
      store.addBook(makeBook(`b${i}`))
    }

    // 上限 8 本，最早瀏覽的 b1 被移除
    expect(store.items).toHaveLength(8)
    expect(store.items.some((b) => b.id === 'b1')).toBe(false)
    // 最新瀏覽的 b9 在最前面
    expect(store.items[0]?.id).toBe('b9')
  })

  // ── localStorage 持久化 ──────────────────────────────────────────────

  it('addBook → 同步寫入 localStorage', () => {
    const store = useRecentlyViewedStore()
    store.addBook(makeBook('b1'))

    const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe('b1')
  })

  it('localStorage 有資料 → store 初始化時讀取', () => {
    // 先寫入假資料到 localStorage
    const books = [makeBook('b1'), makeBook('b2')]
    localStorage.setItem('recentlyViewed', JSON.stringify(books))

    // 重新建立 pinia 模擬重整頁面
    setActivePinia(createPinia())
    const store = useRecentlyViewedStore()

    expect(store.items).toHaveLength(2)
    expect(store.items[0]?.id).toBe('b1')
  })
})
