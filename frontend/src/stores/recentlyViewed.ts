// stores/recentlyViewed.ts — 最近瀏覽書籍 Store，純前端 localStorage 持久化
// 不需後端 API，書籍資料在 BookDetailPage 載入時快取
// 去重邏輯：已存在的書移到最前；超過上限時刪除最舊的
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Book } from '@/types'

const STORAGE_KEY = 'recentlyViewed'
const MAX_ITEMS = 8

export const useRecentlyViewedStore = defineStore('recentlyViewed', () => {
  // 初始值從 localStorage 讀取，重整後保留瀏覽紀錄
  const items = ref<Book[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )

  // BookDetailPage 載入書籍成功後呼叫：去重 → 插頭 → 限制數量 → 持久化
  const addBook = (book: Book) => {
    items.value = items.value.filter((b) => b.id !== book.id)
    items.value.unshift(book)
    if (items.value.length > MAX_ITEMS) {
      items.value = items.value.slice(0, MAX_ITEMS)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
  }

  return { items, addBook }
})
