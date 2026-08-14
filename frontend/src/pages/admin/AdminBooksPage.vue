<script setup lang="ts">
// AdminBooksPage — 後台書籍管理，顯示書籍列表，提供新增、編輯、刪除功能
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

const fetchBooks = async () => {
  loading.value = true
  try {
    const res = await api.get('/books', { params: { page: page.value, pageSize: 20 } })
    books.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
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

      <Pagination v-if="meta" :meta="meta" @change="(p) => { page = p; fetchBooks() }" />
    </div>
  </div>
</template>
