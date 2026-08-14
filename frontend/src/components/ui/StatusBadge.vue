<script setup lang="ts">
// StatusBadge — 把 OrderStatus enum 轉成中文標籤並套用對應顏色
// 前台訂單頁和後台訂單管理共用，統一維護避免不一致
import type { OrderStatus } from '@/types'

defineProps<{ status: OrderStatus }>()

// 查找表比 if/else 簡潔，新增狀態只需加一行
const statusMap: Record<OrderStatus, { label: string; class: string }> = {
  PENDING:   { label: '待付款', class: 'bg-yellow-100 text-yellow-700' },
  PAID:      { label: '已付款', class: 'bg-blue-100 text-blue-700' },
  SHIPPED:   { label: '配送中', class: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: '已完成', class: 'bg-green-100 text-green-700' },
  CANCELLED: { label: '已取消', class: 'bg-gray-100 text-gray-500' },
}
</script>

<template>
  <span :class="['px-2 py-1 text-xs rounded-full font-medium', statusMap[status].class]">
    {{ statusMap[status].label }}
  </span>
</template>
