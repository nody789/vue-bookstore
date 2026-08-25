<script setup lang="ts">
// AdminBookFormPage — 後台書籍新增 / 編輯，共用同一元件靠 route.params.id 判斷模式
// 新增：空白表單 → POST /books；編輯：載入資料填入表單 → PATCH /books/:id
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'
import type { Category } from '@/types'

const route = useRoute()
const router = useRouter()

// isEdit：URL 有 id 參數為編輯模式，無則為新增模式
const isEdit = computed(() => !!route.params['id'])
const pageTitle = computed(() => isEdit.value ? '編輯書籍' : '新增書籍')

const categories = ref<Category[]>([])
const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const errors = ref<Record<string, string>>({})

// fileInput ref：用來觸發 <input type="file"> 的 click 事件（隱藏原生 input）
const fileInput = ref<HTMLInputElement | null>(null)

// 選擇圖片後自動上傳到 Cloudinary，回填 coverImageUrl
const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploadError.value = ''
  uploading.value = true
  try {
    const formData = new FormData()
    // 欄位名稱必須是 'image'，與後端 upload.single('image') 對應
    formData.append('image', file)
    const res = await api.post('/upload', formData)
    form.value.coverImageUrl = res.data.data.url
  } catch {
    uploadError.value = '上傳失敗，請確認圖片格式與大小（上限 5MB）'
  } finally {
    uploading.value = false
    // 清空 file input，讓同一張圖重選時仍能觸發 change 事件
    if (fileInput.value) fileInput.value.value = ''
  }
}

// 可選欄位用空字串初始，送出時轉為 undefined（讓後端視為未填）
const form = ref({
  title: '',
  author: '',
  categoryId: '',
  publisher: '',
  isbn: '',
  description: '',
  price: 0,
  stock: 0,
  coverImageUrl: '',
})

// Promise.all 並行載入分類和書籍資料，比序列 await 更快
onMounted(async () => {
  const [catRes] = await Promise.all([
    api.get('/categories'),
    isEdit.value ? fetchBook() : Promise.resolve(),
  ])
  categories.value = catRes.data.data
})

const fetchBook = async () => {
  loading.value = true
  try {
    const res = await api.get(`/books/${route.params['id']}`)
    const book = res.data.data
    form.value = {
      title: book.title,
      author: book.author,
      categoryId: book.categoryId,
      publisher: book.publisher || '',  // null → '' 讓 input 可以正常顯示
      isbn: book.isbn || '',
      description: book.description || '',
      price: book.price,
      stock: book.stock,
      coverImageUrl: book.coverImageUrl || '',
    }
  } finally {
    loading.value = false
  }
}

// 可選欄位空字串轉為 undefined，避免後端 Zod 驗證當成空字串處理
const submit = async () => {
  errors.value = {}
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      publisher: form.value.publisher || undefined,
      isbn: form.value.isbn || undefined,
      description: form.value.description || undefined,
      coverImageUrl: form.value.coverImageUrl || undefined,
    }
    if (isEdit.value) {
      await api.patch(`/books/${route.params['id']}`, payload)
    } else {
      await api.post('/books', payload)
    }
    router.push('/admin/books')
  } catch (err: unknown) {
    const apiErrors = (err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } })?.response?.data?.errors
    if (apiErrors) {
      apiErrors.forEach(({ field, message }: { field: string; message: string }) => {
        errors.value[field] = message
      })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-4 mb-6">
      <button @click="router.back()" class="text-stone-500 hover:text-amber-700">←</button>
      <h1 class="font-bold text-2xl text-stone-800">{{ pageTitle }}</h1>
    </div>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>

    <form v-else @submit.prevent="submit" class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-sm font-medium text-stone-700 mb-1">書名 *</label>
          <input v-model="form.title" required
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            :class="errors['title'] ? 'border-red-500' : 'border-gray-300'" />
          <p v-if="errors['title']" class="text-red-600 text-xs mt-1">{{ errors['title'] }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">作者 *</label>
          <input v-model="form.author" required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">分類 *</label>
          <select v-model="form.categoryId" required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">選擇分類</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">售價（元）*</label>
          <input v-model.number="form.price" type="number" min="0" required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">庫存數量 *</label>
          <input v-model.number="form.stock" type="number" min="0" required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">出版社</label>
          <input v-model="form.publisher"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">ISBN</label>
          <input v-model="form.isbn"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-stone-700 mb-2">封面圖片</label>

          <!-- 圖片預覽 -->
          <div v-if="form.coverImageUrl" class="mb-3">
            <img :src="form.coverImageUrl" alt="封面預覽"
              class="w-28 h-36 object-cover rounded-lg border border-gray-200 shadow-sm" />
          </div>

          <!-- 隱藏的 file input（由按鈕觸發） -->
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />

          <!-- 上傳按鈕 -->
          <button type="button" @click="fileInput?.click()" :disabled="uploading"
            class="inline-flex items-center gap-2 border border-gray-300 text-stone-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-60 mb-2">
            <span v-if="uploading">上傳中...</span>
            <span v-else>{{ form.coverImageUrl ? '重新上傳' : '選擇圖片' }}</span>
          </button>

          <p v-if="uploadError" class="text-red-600 text-xs mb-2">{{ uploadError }}</p>

          <!-- 手動貼 URL 作為備用 -->
          <p class="text-xs text-stone-400 mb-1">或直接貼上圖片網址</p>
          <input v-model="form.coverImageUrl" placeholder="https://..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div class="col-span-2">
          <label class="block text-sm font-medium text-stone-700 mb-1">書籍簡介</label>
          <textarea v-model="form.description" rows="4"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="submitting"
          class="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg text-sm transition disabled:opacity-60">
          {{ submitting ? '儲存中...' : '儲存' }}
        </button>
        <button type="button" @click="router.back()"
          class="border border-gray-300 text-stone-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
          取消
        </button>
      </div>
    </form>
  </div>
</template>
