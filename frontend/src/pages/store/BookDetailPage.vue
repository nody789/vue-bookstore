<script setup lang="ts">
// BookDetailPage — 書籍詳情頁，從 URL 取得書籍 ID 後打 API 顯示詳情
// 【資料流】route.params.id → API → book ref → 模板渲染
// 加入購物車：未登入跳轉登入頁（帶 redirect），已登入呼叫 cart.addItem
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import BookCard from '@/components/ui/BookCard.vue'
import type { Book } from '@/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const toast = useToast()

const book = ref<Book | null>(null)
const loading = ref(true)
const relatedBooks = ref<Book[]>([])
// quantity：購買數量，模板用 Math.max/min 限制在 1 到庫存之間
const quantity = ref(1)
// adding：加入中時按鈕 disabled，避免重複點擊
const adding = ref(false)

// 載入失敗（404 等）直接跳回首頁
onMounted(async () => {
  try {
    const res = await api.get(`/books/${route.params['id']}`)
    book.value = res.data.data
    // 載入同分類的相關書籍（排除自己），最多顯示 4 本
    const related = await api.get('/books', {
      params: { categoryId: book.value!.category.id, pageSize: 5 },
    })
    relatedBooks.value = (related.data.data as Book[]).filter((b) => b.id !== book.value!.id).slice(0, 4)
  } catch {
    router.push('/')
  } finally {
    loading.value = false
  }
})

const addToCart = async () => {
  if (!auth.isLoggedIn) {
    // 帶 redirect 讓登入後可以返回此頁
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  adding.value = true
  try {
    await cart.addItem(book.value!.id, quantity.value)
    toast.success('已加入購物車！')
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>
  <div v-else-if="book" class="max-w-4xl mx-auto">
    <button @click="router.back()" class="text-stone-500 hover:text-amber-700 mb-6 flex items-center gap-1 text-sm">
      ← 返回
    </button>
    <div class="flex flex-col md:flex-row gap-8">
      <!-- 封面 -->
      <div class="w-full md:w-64 shrink-0">
        <div class="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
          <img v-if="book.coverImageUrl" :src="book.coverImageUrl" :alt="book.title"
            class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-stone-400">
            <svg class="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 書籍資訊 -->
      <div class="flex-1">
        <span class="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">{{ book.category.name }}</span>
        <h1 class="font-bold text-2xl text-stone-800 mt-3 mb-1">{{ book.title }}</h1>
        <p class="text-stone-500">{{ book.author }}</p>
        <p v-if="book.publisher" class="text-stone-400 text-sm mt-1">{{ book.publisher }}</p>

        <p class="font-bold text-3xl text-amber-700 mt-6">NT$ {{ book.price.toLocaleString() }}</p>

        <p class="mt-2 text-sm" :class="book.stock > 0 ? 'text-green-600' : 'text-red-500'">
          {{ book.stock > 0 ? `庫存 ${book.stock} 本` : '已售完' }}
        </p>

        <div v-if="book.description" class="mt-4 text-stone-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {{ book.description }}
        </div>

        <!-- 數量 + 加入購物車 -->
        <div v-if="book.stock > 0" class="flex items-center gap-3 mt-6">
          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button @click="quantity = Math.max(1, quantity - 1)"
              class="px-3 py-2 text-stone-600 hover:bg-gray-50 transition">−</button>
            <span class="px-4 py-2 text-sm">{{ quantity }}</span>
            <button @click="quantity = Math.min(book.stock, quantity + 1)"
              class="px-3 py-2 text-stone-600 hover:bg-gray-50 transition">+</button>
          </div>
          <button @click="addToCart" :disabled="adding"
            class="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg transition disabled:opacity-60">
            {{ adding ? '加入中...' : '加入購物車' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 相關書籍 -->
    <div v-if="relatedBooks.length > 0" class="mt-12">
      <h2 class="font-semibold text-stone-700 text-lg mb-4">同分類的書籍</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <BookCard v-for="b in relatedBooks" :key="b.id" :book="b" />
      </div>
    </div>
  </div>
</template>
