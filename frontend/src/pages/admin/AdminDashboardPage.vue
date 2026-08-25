<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'

const router = useRouter()
const loading = ref(true)

const stats = ref({
  totalBooks: 0,
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  lowStockBooks: 0,
  recentOrders: [] as Array<{
    id: string
    createdAt: string
    totalAmount: number
    status: string
    user: { name: string }
    items: Array<{ bookTitle: string; quantity: number }>
  }>,
})

const statusLabel: Record<string, string> = {
  PENDING: '待付款', PAID: '已付款', SHIPPED: '配送中', COMPLETED: '已完成', CANCELLED: '已取消',
}

const statusStyle: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  PAID: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

onMounted(async () => {
  try {
    const res = await api.get('/stats')
    stats.value = res.data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="font-bold text-2xl text-stone-800 mb-6">統計看板</h1>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>

    <div v-else>
      <!-- 數字卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-stone-400 mb-1">書籍總數</p>
          <p class="text-3xl font-bold text-stone-800">{{ stats.totalBooks }}</p>
          <button @click="router.push('/admin/books')"
            class="text-xs text-amber-600 hover:text-amber-700 mt-2 block">管理書籍 →</button>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-stone-400 mb-1">訂單總數</p>
          <p class="text-3xl font-bold text-stone-800">{{ stats.totalOrders }}</p>
          <button @click="router.push('/admin/orders')"
            class="text-xs text-amber-600 hover:text-amber-700 mt-2 block">查看訂單 →</button>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-stone-400 mb-1">累計營收</p>
          <p class="text-3xl font-bold text-amber-700">NT$ {{ stats.totalRevenue.toLocaleString() }}</p>
          <p class="text-xs text-stone-400 mt-2">所有已成立訂單</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p class="text-xs text-stone-400 mb-1">待處理</p>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingOrders }}</p>
          <p class="text-xs text-stone-400 mt-2">待付款訂單</p>
        </div>
      </div>

      <!-- 低庫存警示 -->
      <div v-if="stats.lowStockBooks > 0"
        class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-amber-600 text-xl">⚠</span>
          <div>
            <p class="text-sm font-semibold text-amber-800">有 {{ stats.lowStockBooks }} 本書籍庫存不足（≤ 5 本）</p>
            <p class="text-xs text-amber-600 mt-0.5">請盡快補充庫存</p>
          </div>
        </div>
        <button @click="router.push('/admin/books')"
          class="text-sm text-amber-700 border border-amber-300 px-4 py-1.5 rounded-lg hover:bg-amber-100 transition">
          前往管理
        </button>
      </div>

      <!-- 最新訂單 -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-stone-700">最新訂單</h2>
          <button @click="router.push('/admin/orders')"
            class="text-xs text-amber-600 hover:text-amber-700">查看全部 →</button>
        </div>
        <div v-if="stats.recentOrders.length === 0" class="text-center py-10 text-stone-400 text-sm">
          尚無訂單
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="order in stats.recentOrders" :key="order.id"
            class="flex items-center gap-4 px-6 py-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-800 truncate">{{ order.user.name }}</p>
              <p class="text-xs text-stone-400 mt-0.5">
                {{ order.items.map(i => `${i.bookTitle} ×${i.quantity}`).join('、') }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-amber-700">NT$ {{ order.totalAmount.toLocaleString() }}</p>
              <p class="text-xs text-stone-400 mt-0.5">{{ new Date(order.createdAt).toLocaleDateString('zh-TW') }}</p>
            </div>
            <span :class="['text-xs px-2 py-1 rounded-full font-medium shrink-0', statusStyle[order.status]]">
              {{ statusLabel[order.status] }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
