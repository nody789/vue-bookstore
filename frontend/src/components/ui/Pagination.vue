<script setup lang="ts">
// Pagination — 分頁導航元件，只負責顯示和 emit 點擊事件，不自行修改頁碼
// 【資料流】父元件 :meta → 顯示頁碼 → 使用者點擊 → emit('change', page) → 父元件更新
import type { PaginationMeta } from '@/types'

const props = defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ (e: 'change', page: number): void }>()

// 產生頁碼陣列，例如 totalPages=5 → [1,2,3,4,5]
const pages = () => {
  const result: number[] = []
  for (let i = 1; i <= props.meta.totalPages; i++) result.push(i)
  return result
}
</script>

<template>
  <div v-if="meta.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
    <button :disabled="meta.page === 1" @click="emit('change', meta.page - 1)"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-stone-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
      ←
    </button>
    <button v-for="p in pages()" :key="p" @click="emit('change', p)"
      :class="['px-3 py-2 text-sm rounded border transition',
        p === meta.page
          ? 'bg-amber-700 text-white border-amber-700'
          : 'border-gray-300 dark:border-gray-600 text-stone-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700']">
      {{ p }}
    </button>
    <button :disabled="meta.page === meta.totalPages" @click="emit('change', meta.page + 1)"
      class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 text-stone-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
      →
    </button>
  </div>
</template>
