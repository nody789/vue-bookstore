<script setup lang="ts">
// BookCard — 書籍卡片元件，顯示封面（含 fallback CSS 書封）、書名、價格、庫存狀態
// 【資料流】HomePage → :book props → 模板渲染，整個卡片可點擊跳轉詳情頁
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Book } from '@/types'

const props = defineProps<{ book: Book }>()

// imgError：圖片載入失敗時為 true，切換顯示 CSS 書封
const imgError = ref(false)

// 無封面圖時依分類顯示不同漸層色的 CSS 書封
const categoryGradient: Record<string, string> = {
  '文學小說': 'linear-gradient(160deg, #7f1d1d 0%, #b91c1c 100%)',
  '商業理財': 'linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 100%)',
  '科技':     'linear-gradient(160deg, #1e293b 0%, #334155 100%)',
  '心理勵志': 'linear-gradient(160deg, #052e16 0%, #15803d 100%)',
  '人文歷史': 'linear-gradient(160deg, #451a03 0%, #b45309 100%)',
}

// 查不到分類時用預設深灰漸層
const coverStyle = computed(() => ({
  background: categoryGradient[props.book.category?.name] ?? 'linear-gradient(160deg, #1c1917, #57534e)',
}))

// 有 coverImageUrl 且圖片未載入失敗，才顯示真實圖片
const showCoverImage = computed(() => !!props.book.coverImageUrl && !imgError.value)
</script>

<template>
  <RouterLink :to="`/books/${book.id}`"
    class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col">

    <!-- 封面（3:4 比例） -->
    <div class="aspect-[3/4] overflow-hidden relative shrink-0">

      <!-- 有封面圖時顯示 -->
      <img
        v-if="showCoverImage"
        :src="book.coverImageUrl!"
        :alt="book.title"
        @error="imgError = true"
        class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
      />

      <!-- CSS 設計書封（無圖片時） -->
      <div v-else class="w-full h-full flex flex-col justify-between p-4 text-white" :style="coverStyle">
        <!-- 書封頂部裝飾線 -->
        <div class="space-y-1.5 opacity-50">
          <div class="w-10 h-0.5 bg-white rounded-full"></div>
          <div class="w-14 h-0.5 bg-white rounded-full"></div>
          <div class="w-7  h-0.5 bg-white rounded-full"></div>
        </div>

        <!-- 書名 + 作者 -->
        <div>
          <p class="font-bold text-base leading-snug line-clamp-3 mb-2 tracking-wide">
            {{ book.title }}
          </p>
          <p class="text-xs opacity-60 tracking-widest">{{ book.author }}</p>
        </div>

        <!-- 書封底部 -->
        <div>
          <div class="w-full h-px bg-white opacity-20 mb-1.5"></div>
          <p class="text-xs opacity-30 tracking-widest">Vue Bookstore</p>
        </div>
      </div>

      <!-- 分類標籤（右下角） -->
      <span
        class="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
        {{ book.category?.name }}
      </span>
    </div>

    <!-- 書籍資訊 -->
    <div class="p-3 flex flex-col gap-1 flex-1">
      <p class="font-semibold text-stone-800 text-sm line-clamp-2 leading-snug">{{ book.title }}</p>
      <p class="text-stone-400 text-xs">{{ book.author }}</p>
      <div class="flex items-center justify-between mt-auto pt-2">
        <span class="font-bold text-amber-700 text-sm">NT$ {{ book.price.toLocaleString() }}</span>
        <span v-if="book.stock === 0" class="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">已售完</span>
        <span v-else class="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">有庫存</span>
      </div>
    </div>
  </RouterLink>
</template>
