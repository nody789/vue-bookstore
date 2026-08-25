<script setup lang="ts">
// DefaultLayout — 前台共用版型（公告列 + Navbar + 主內容 + Footer）
// 切換頁面時 Navbar/Footer 不重新渲染，只有 RouterView 的內容換頁
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { ref } from 'vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

// userMenuOpen：使用者頭像下拉選單的展開狀態，只有 Layout 用到
const userMenuOpen = ref(false)

const handleLogout = () => {
  auth.logout()
  userMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- 公告列 -->
    <div class="bg-amber-800 text-amber-50 text-center text-xs py-2 px-4">
      🎉 精選書單上架中 &nbsp;·&nbsp; 滿 599 元免運費 &nbsp;·&nbsp; 全站書籍特價優惠中
    </div>

    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="font-bold text-xl text-amber-800 shrink-0 flex items-center gap-2">
          <span class="text-2xl">📚</span> Vue Bookstore
        </RouterLink>

        <!-- 搜尋框（中間）：Enter 後跳轉首頁並帶 keyword query -->
        <div class="flex-1 max-w-md hidden md:block">
          <input
            type="text"
            placeholder="搜尋書名、作者..."
            @keyup.enter="(e) => {
              const q = (e.target as HTMLInputElement).value.trim()
              if (q) router.push({ path: '/', query: { keyword: q } })
              else router.push('/')
            }"
            class="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
          />
        </div>

        <!-- 右側操作區 -->
        <div class="flex items-center gap-3">
          <!-- 購物車 -->
          <RouterLink to="/cart" class="relative p-2 text-stone-500 hover:text-amber-700 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cart.itemCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {{ cart.itemCount }}
            </span>
          </RouterLink>

          <!-- 登入狀態 -->
          <template v-if="auth.isLoggedIn">
            <div class="relative">
              <button @click="userMenuOpen = !userMenuOpen"
                class="flex items-center gap-2 text-sm text-stone-700 hover:text-amber-700 transition">
                <span class="hidden sm:block font-medium">{{ auth.user?.name }}</span>
                <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                  {{ auth.user?.name?.charAt(0) }}
                </div>
              </button>
              <!-- 下拉選單 -->
              <div v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm overflow-hidden">
                <RouterLink to="/profile" @click="userMenuOpen = false"
                  class="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-amber-50 transition">
                  <span>👤</span> 個人資料
                </RouterLink>
                <RouterLink to="/orders" @click="userMenuOpen = false"
                  class="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-amber-50 transition">
                  <span>📦</span> 我的訂單
                </RouterLink>
                <RouterLink v-if="auth.isAdmin" to="/admin" @click="userMenuOpen = false"
                  class="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-amber-50 transition">
                  <span>⚙️</span> 後台管理
                </RouterLink>
                <div class="border-t border-gray-100 my-1"></div>
                <button @click="handleLogout"
                  class="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition">
                  <span>🚪</span> 登出
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login"
              class="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2 rounded-full text-sm font-medium transition shadow-sm">
              登入 / 註冊
            </RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主內容 -->
    <main class="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-stone-900 text-stone-400 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          <!-- 品牌區 -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span class="text-2xl">📚</span> Vue Bookstore
            </div>
            <p class="text-sm leading-relaxed text-stone-500">
              探索知識的無限可能。<br>
              每一本書，都是一趟心靈旅程。
            </p>
            <!-- 社群連結 -->
            <div class="flex gap-3 mt-5">
              <a href="#" class="w-8 h-8 bg-stone-700 hover:bg-amber-700 rounded-full flex items-center justify-center text-sm transition">f</a>
              <a href="#" class="w-8 h-8 bg-stone-700 hover:bg-amber-700 rounded-full flex items-center justify-center text-sm transition">in</a>
              <a href="#" class="w-8 h-8 bg-stone-700 hover:bg-amber-700 rounded-full flex items-center justify-center text-sm transition">IG</a>
            </div>
          </div>

          <!-- 關於書店 -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide">關於書店</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-amber-400 transition">關於我們</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">加入會員</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">商業合作</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">出版社專區</a></li>
            </ul>
          </div>

          <!-- 購書說明 -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide">購書說明</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-amber-400 transition">如何購物</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">付款方式</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">配送說明</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">退換貨政策</a></li>
            </ul>
          </div>

          <!-- 客服中心 -->
          <div>
            <h4 class="text-white font-semibold mb-4 text-sm tracking-wide">客服中心</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-amber-400 transition">常見問題</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">聯絡我們</a></li>
              <li><a href="#" class="hover:text-amber-400 transition">意見回饋</a></li>
            </ul>
            <div class="mt-4 text-xs text-stone-500">
              <p>客服時間</p>
              <p class="text-stone-400">週一至週五 09:00–18:00</p>
            </div>
          </div>
        </div>

        <!-- 底部分隔 + 版權 -->
        <div class="border-t border-stone-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <p>© 2026 Vue Bookstore. All Rights Reserved.</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-stone-400 transition">隱私政策</a>
            <a href="#" class="hover:text-stone-400 transition">服務條款</a>
            <a href="#" class="hover:text-stone-400 transition">Cookie 設定</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
