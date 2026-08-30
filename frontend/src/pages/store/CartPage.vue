<script setup lang="ts">
// CartPage — 購物車頁面，直接使用 cart store 的資料（App.vue 登入後已載入）
// 不需要 onMounted 打 API，Pinia store 統一管理資料，頁面只負責顯示
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
const router = useRouter()
const toast = useToast()

const handleUpdate = async (itemId: string, quantity: number) => {
  await cart.updateItem(itemId, quantity)
}

// removeItem 使用樂觀更新（本地直接刪除不重新 fetch），畫面即時響應
const handleRemove = async (itemId: string) => {
  await cart.removeItem(itemId)
  toast.success('已移除商品')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="font-bold text-2xl text-stone-800 dark:text-gray-100 mb-6">購物車</h1>

    <div v-if="cart.items.length === 0" class="text-center py-20">
      <p class="text-stone-400 dark:text-gray-500 mb-4">購物車是空的</p>
      <RouterLink to="/" class="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg transition text-sm">
        去逛書店
      </RouterLink>
    </div>

    <div v-else>
      <!-- 購物車項目 -->
      <div class="space-y-4">
        <div v-for="item in cart.items" :key="item.id"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4">
          <!-- 封面縮圖 -->
          <div class="w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden shrink-0">
            <img v-if="item.book.coverImageUrl" :src="item.book.coverImageUrl" :alt="item.book.title"
              class="w-full h-full object-cover" />
          </div>
          <!-- 書籍資訊 -->
          <div class="flex-1">
            <p class="font-medium text-stone-800 dark:text-gray-100 text-sm">{{ item.book.title }}</p>
            <p class="text-stone-400 dark:text-gray-500 text-xs">{{ item.book.author }}</p>
            <p class="text-amber-700 dark:text-amber-500 font-bold mt-1">NT$ {{ item.book.price.toLocaleString() }}</p>
          </div>
          <!-- 數量控制 -->
          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden text-sm">
            <button @click="handleUpdate(item.id, item.quantity - 1)" :disabled="item.quantity <= 1"
              class="px-2 py-1 text-stone-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">−</button>
            <span class="px-3 py-1 dark:text-gray-200">{{ item.quantity }}</span>
            <button @click="handleUpdate(item.id, item.quantity + 1)" :disabled="item.quantity >= item.book.stock"
              class="px-2 py-1 text-stone-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40">+</button>
          </div>
          <!-- 小計 -->
          <p class="text-stone-700 dark:text-gray-200 font-medium w-20 text-right text-sm">
            NT$ {{ (item.book.price * item.quantity).toLocaleString() }}
          </p>
          <!-- 刪除 -->
          <button @click="handleRemove(item.id)" class="text-red-400 hover:text-red-600 transition ml-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 總計 + 結帳 -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
        <div class="flex justify-between text-stone-700 dark:text-gray-200 mb-4">
          <span>共 {{ cart.itemCount }} 件商品</span>
          <span class="font-bold text-lg">NT$ {{ cart.total.toLocaleString() }}</span>
        </div>
        <button @click="router.push('/checkout')"
          class="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-medium transition">
          前往結帳
        </button>
      </div>
    </div>
  </div>
</template>
