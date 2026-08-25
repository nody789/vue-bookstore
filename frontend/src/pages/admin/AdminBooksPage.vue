<script setup lang="ts">
// AdminBooksPage — 後台書籍管理，顯示書籍列表，提供搜尋、新增、編輯、刪除功能
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import Pagination from '@/components/ui/Pagination.vue'
import { useToast } from '@/composables/useToast'
import type { Book, PaginationMeta } from '@/types'

const router = useRouter()
const toast = useToast()

const books = ref<Book[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)
const page = ref(1)
const keyword = ref('')

const fetchBooks = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = { page: page.value, pageSize: 20 }
    if (keyword.value) params['keyword'] = keyword.value
    const res = await api.get('/books', { params })
    books.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
}

// debounce：停止輸入 400ms 後才打 API，搜尋時重設頁碼
let searchTimer: ReturnType<typeof setTimeout>
const onSearch = (e: Event) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    keyword.value = (e.target as HTMLInputElement).value.trim()
    page.value = 1
    fetchBooks()
  }, 400)
}

const clearSearch = () => {
  keyword.value = ''
  page.value = 1
  const input = document.getElementById('admin-book-search') as HTMLInputElement | null
  if (input) input.value = ''
  fetchBooks()
}

// 先 confirm 確認防止誤刪，刪後重新 fetch 確保分頁與後端同步
const deleteBook = async (id: string, title: string) => {
  if (!confirm(`確定要刪除《${title}》嗎？`)) return
  await api.delete(`/books/${id}`)
  await fetchBooks()
  toast.success(`《${title}》已刪除`)
}

onMounted(fetchBooks)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-bold text-2xl text-stone-800">書籍管理</h1>
      <button @click="router.push('/admin/books/new')"
        class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm transition">
        + 新增書籍
      </button>
    </div>

    <!-- 搜尋列 -->
    <div class="mb-4 flex items-center gap-3">
      <div class="relative flex-1 max-w-sm">
        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          id="admin-book-search"
          type="text"
          placeholder="搜尋書名、作者..."
          @input="onSearch"
          class="w-full border border-gray-300 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        />
        <button v-if="keyword" @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p v-if="meta" class="text-xs text-stone-400 shrink-0">
        共 {{ meta.total }} 筆<span v-if="keyword">（搜尋：{{ keyword }}）</span>
      </p>
    </div>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>
    <div v-else>
      <table class="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr class="bg-gray-100 text-stone-600 text-left">
            <th class="px-4 py-3 font-medium">書名</th>
            <th class="px-4 py-3 font-medium">作者</th>
            <th class="px-4 py-3 font-medium">分類</th>
            <th class="px-4 py-3 font-medium text-right">售價</th>
            <th class="px-4 py-3 font-medium text-right">庫存</th>
            <th class="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="book in books" :key="book.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-stone-800 max-w-48 truncate">{{ book.title }}</td>
            <td class="px-4 py-3 text-stone-600">{{ book.author }}</td>
            <td class="px-4 py-3 text-stone-500">{{ book.category.name }}</td>
            <td class="px-4 py-3 text-right text-amber-700 font-medium">{{ book.price.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right" :class="book.stock === 0 ? 'text-red-500' : 'text-stone-600'">
              {{ book.stock }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <button @click="router.push(`/admin/books/${book.id}/edit`)"
                  class="text-blue-600 hover:text-blue-700 text-xs border border-blue-200 px-2 py-1 rounded">編輯</button>
                <button @click="deleteBook(book.id, book.title)"
                  class="text-red-600 hover:text-red-700 text-xs border border-red-200 px-2 py-1 rounded">刪除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination v-if="meta" :meta="meta" @change="(p) => { page.value = p; fetchBooks() }" />
    </div>
  </div>
</template>
