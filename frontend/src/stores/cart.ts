// stores/cart.ts — 購物車全域 Store，管理購物車項目和載入狀態
// 資料真實來源是後端，items 是快取副本；登出只清記憶體，後端資料保留
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import type { CartItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  // 購物車總數量，顯示在 Navbar badge
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  // 購物車總金額，用於結帳頁小計和判斷免運門檻
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.book.price * item.quantity, 0),
  )

  // 從後端同步購物車：登入後由 App.vue 觸發，或操作後重新同步
  const fetchCart = async () => {
    loading.value = true
    try {
      const res = await api.get('/cart')
      items.value = res.data.data
    } finally {
      loading.value = false
    }
  }

  // 新增後重新 fetch，確保後端合併數量後的實際值正確顯示
  const addItem = async (bookId: string, quantity: number) => {
    await api.post('/cart/items', { bookId, quantity })
    await fetchCart()
  }

  const updateItem = async (itemId: string, quantity: number) => {
    await api.patch(`/cart/items/${itemId}`, { quantity })
    await fetchCart()
  }

  // 刪除使用樂觀更新（本地直接過濾），不重新 fetch，避免閃爍
  const removeItem = async (itemId: string) => {
    await api.delete(`/cart/items/${itemId}`)
    items.value = items.value.filter((i) => i.id !== itemId)
  }

  // 登出時只清除前端記憶體，後端資料保留
  const clearLocal = () => {
    items.value = []
  }

  return { items, loading, itemCount, total, fetchCart, addItem, updateItem, removeItem, clearLocal }
})
