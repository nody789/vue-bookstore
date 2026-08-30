<script setup lang="ts">
// HomePage — 前台首頁，提供分類篩選、關鍵字搜尋、書籍網格、分頁
// 【資料流】onMounted 同時載入分類和書籍，篩選條件變動時 watch 重新打 API
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/lib/api'
import { useRecentlyViewedStore } from '@/stores/recentlyViewed'
import BookCard from '@/components/ui/BookCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Book, Category, PaginationMeta } from '@/types'

const route = useRoute()
const recentlyViewed = useRecentlyViewedStore()

const books = ref<Book[]>([])
const categories = ref<Category[]>([])
const meta = ref<PaginationMeta | null>(null)
// loading：true 時顯示骨架屏
const loading = ref(false)

// filters：統一管理查詢參數，watch 只需監聽一個 ref（用 deep: true）
// 切換分類或搜尋時把 page 重設為 1，避免停留在不存在的頁碼
// 初始值讀取 URL query，支援 Navbar 搜尋跳轉（?keyword=xxx）
const filters = ref({
  page: 1,
  categoryId: '',
  keyword: (route.query['keyword'] as string) ?? '',
})

const fetchBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: filters.value.page,
      pageSize: 20,
      ...(filters.value.categoryId && { categoryId: filters.value.categoryId }),
      ...(filters.value.keyword && { keyword: filters.value.keyword }),
    }
    const res = await api.get('/books', { params })
    books.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  const res = await api.get('/categories')
  categories.value = res.data.data
}

// filters 任一欄位改變就重新打 API；不加 immediate 避免與 onMounted 重複執行
watch(filters, () => fetchBooks(), { deep: true })

// Navbar 搜尋跳轉時 route.query 改變 → 同步更新 filters
watch(() => route.query['keyword'], (kw) => {
  filters.value.keyword = (kw as string) ?? ''
  filters.value.page = 1
})

// keywordTimer：搜尋 debounce，停止輸入 400ms 後才觸發，避免每打一字就打 API
let keywordTimer: ReturnType<typeof setTimeout>
const onKeywordInput = (e: Event) => {
  clearTimeout(keywordTimer)
  keywordTimer = setTimeout(() => {
    filters.value.keyword = (e.target as HTMLInputElement).value
    filters.value.page = 1
  }, 400)
}

const onCategoryChange = (id: string) => {
  filters.value.categoryId = id
  filters.value.page = 1
}

const onPageChange = (page: number) => {
  filters.value.page = page
}

// 平滑捲動到書籍列表區（Hero Banner 的「立即選購」按鈕使用）
const scrollToBooks = () => {
  document.getElementById('book-list')?.scrollIntoView({ behavior: 'smooth' })
}

// 同時發出兩個 API 請求，不需等待對方，並行執行更快
onMounted(() => {
  fetchCategories()
  fetchBooks()
})
</script>

<template>
  <div>
    <!-- ─── Hero Banner ──────────────────────────────────────────── -->
    <div class="-mx-4 -mt-8 mb-10 relative overflow-hidden"
      style="background: linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)">

      <!-- 背景裝飾圓 -->
      <div class="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10"
        style="background: rgba(255,255,255,0.3)"></div>
      <div class="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10"
        style="background: rgba(255,255,255,0.2)"></div>

      <div class="relative max-w-7xl mx-auto px-8 py-14 flex flex-col md:flex-row items-center gap-10">

        <!-- 文字區 -->
        <div class="flex-1 text-white text-center md:text-left">
          <p class="text-amber-300 text-sm font-medium tracking-widest mb-3 uppercase">Welcome to Vue Bookstore</p>
          <h1 class="text-3xl md:text-5xl font-bold leading-tight mb-4">
            探索知識的<br>無限可能
          </h1>
          <p class="text-amber-100 text-base md:text-lg mb-8 opacity-90">
            精選好書，陪你度過每一個求知的時刻
          </p>

          <!-- CTA 按鈕 -->
          <div class="flex flex-wrap gap-3 justify-center md:justify-start">
            <button @click="scrollToBooks"
              class="bg-white text-amber-800 font-semibold px-6 py-3 rounded-full hover:bg-amber-50 transition shadow-md text-sm">
              立即選購 →
            </button>
            <RouterLink to="/login"
              class="border border-white/50 text-white px-6 py-3 rounded-full hover:bg-white/10 transition text-sm">
              免費加入會員
            </RouterLink>
          </div>
        </div>

        <!-- 統計數字（從已有的 meta / categories 取值，不額外打 API） -->
        <div class="flex md:flex-col gap-6 md:gap-4 shrink-0">
          <div class="text-center bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/20 min-w-[88px]">
            <p class="text-3xl font-bold text-white">
              <span v-if="meta">{{ meta.total }}</span>
              <span v-else class="inline-block w-8 h-7 bg-white/20 rounded animate-pulse"></span>
            </p>
            <p class="text-amber-200 text-xs mt-1">精選書籍</p>
          </div>
          <div class="text-center bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/20 min-w-[88px]">
            <p class="text-3xl font-bold text-white">
              <span v-if="categories.length">{{ categories.length }}</span>
              <span v-else class="inline-block w-8 h-7 bg-white/20 rounded animate-pulse"></span>
            </p>
            <p class="text-amber-200 text-xs mt-1">書籍分類</p>
          </div>
          <div class="text-center bg-white/10 backdrop-blur rounded-2xl px-6 py-4 border border-white/20 min-w-[88px]">
            <p class="text-3xl font-bold text-white">免運</p>
            <p class="text-amber-200 text-xs mt-1">滿 599 元</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── 最近瀏覽 ──────────────────────────────────────────────── -->
    <div v-if="recentlyViewed.items.length > 0" class="mb-10">
      <h2 class="font-semibold text-stone-700 dark:text-gray-200 text-lg mb-4">最近瀏覽</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <BookCard v-for="book in recentlyViewed.items" :key="book.id" :book="book" />
      </div>
    </div>

    <!-- ─── 分類 + 搜尋 ──────────────────────────────────────────── -->
    <div id="book-list" class="flex flex-wrap items-center gap-2 mb-6">
      <button @click="onCategoryChange('')"
        :class="['px-4 py-1.5 rounded-full text-sm border font-medium transition',
          !filters.categoryId
            ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
            : 'border-gray-300 dark:border-gray-600 text-stone-500 dark:text-gray-400 hover:border-amber-600 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400']">
        全部
      </button>
      <button v-for="cat in categories" :key="cat.id" @click="onCategoryChange(cat.id)"
        :class="['px-4 py-1.5 rounded-full text-sm border font-medium transition',
          filters.categoryId === cat.id
            ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
            : 'border-gray-300 dark:border-gray-600 text-stone-500 dark:text-gray-400 hover:border-amber-600 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400']">
        {{ cat.name }}
      </button>

      <!-- 搜尋框推到右側 -->
      <div class="ml-auto">
        <div class="relative">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input type="text" placeholder="搜尋書名、作者..." @input="onKeywordInput"
            :value="filters.keyword"
            class="border border-gray-300 dark:border-gray-600 rounded-full pl-9 pr-4 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-stone-800 dark:text-gray-100 placeholder:text-stone-400 dark:placeholder:text-gray-500" />
        </div>
      </div>
    </div>

    <!-- 書籍數量提示 -->
    <div v-if="!loading && meta" class="text-xs text-stone-400 dark:text-gray-500 mb-4">
      共 {{ meta.total }} 本書籍
      <span v-if="filters.keyword">｜搜尋「{{ filters.keyword }}」</span>
      <span v-if="filters.categoryId && categories.find(c => c.id === filters.categoryId)">
        ｜分類：{{ categories.find(c => c.id === filters.categoryId)?.name }}
      </span>
    </div>

    <!-- ─── 書籍格線 ──────────────────────────────────────────────── -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div v-for="i in 10" :key="i" class="animate-pulse">
        <div class="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 w-3/4"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>

    <div v-else-if="books.length === 0"
      class="text-center py-24 text-stone-400 dark:text-gray-500">
      <p class="text-4xl mb-4">📭</p>
      <p class="text-lg font-medium mb-1">找不到相關書籍</p>
      <p class="text-sm">試試其他關鍵字或分類</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <!-- key 用 id 不用 index，確保 Vue 正確追蹤每個書籍節點 -->
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>

    <Pagination v-if="meta && meta.totalPages > 1" :meta="meta" @change="onPageChange" class="mt-8" />
  </div>
</template>
