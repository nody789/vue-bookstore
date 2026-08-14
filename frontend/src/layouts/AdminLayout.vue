<script setup lang="ts">
// AdminLayout — 後台共用版型（左側 Sidebar + 右側 RouterView）
// 權限由路由守衛保護，Layout 本身不需再做判斷
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-200 fixed h-full flex flex-col">
      <div class="p-6 border-b border-gray-200">
        <RouterLink to="/" class="font-bold text-amber-700">📚 Vue Bookstore</RouterLink>
        <p class="text-xs text-stone-400 mt-1">後台管理</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <RouterLink to="/admin/books"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700"
          active-class="bg-amber-50 text-amber-700 font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          書籍管理
        </RouterLink>
        <RouterLink to="/admin/orders"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700"
          active-class="bg-amber-50 text-amber-700 font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          訂單管理
        </RouterLink>
        <RouterLink to="/admin/coupons"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-700"
          active-class="bg-amber-50 text-amber-700 font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          折價券管理
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <p class="text-xs text-stone-400 mb-2">{{ auth.user?.name }}</p>
        <button @click="handleLogout"
          class="w-full text-left text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition">
          登出
        </button>
      </div>
    </aside>

    <!-- 主內容 -->
    <main class="ml-56 flex-1 p-8">
      <RouterView />
    </main>
  </div>
</template>
