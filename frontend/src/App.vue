<script setup lang="ts">
// App.vue — 根元件，監聽登入狀態同步購物車，並掛載全域 ToastContainer
// 【資料流】auth.isLoggedIn → watch → fetchCart（登入）/ clearLocal（登出）
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'
import { watch } from 'vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const theme = useThemeStore()

// 啟動時立即同步 <html> class，避免重整頁面閃白
theme.init()

// 監聽登入狀態：登入後同步購物車，登出後清空記憶體
// immediate: true 確保重整頁面時（localStorage 有 token）立即執行一次
watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) cart.fetchCart()  // 登入後從後端同步購物車
    else cart.clearLocal()            // 登出後清空記憶體中的購物車（後端資料保留）
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
