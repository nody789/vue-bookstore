<script setup lang="ts">
// OrdersPage — 我的訂單列表（前台），後端依 JWT 自動篩選當前使用者的訂單
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Order, PaginationMeta } from '@/types'

const router = useRouter()
const orders = ref<Order[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)
const page = ref(1)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/orders', { params: { page: page.value } })
    orders.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="font-bold text-2xl text-stone-800 dark:text-gray-100 mb-6">我的訂單</h1>

    <div v-if="loading" class="text-center py-20 text-stone-400 dark:text-gray-500">載入中...</div>
    <div v-else-if="orders.length === 0" class="text-center py-20 text-stone-400 dark:text-gray-500">還沒有訂單</div>
    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <!-- 訂單標頭 -->
        <div class="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p class="text-xs text-stone-400 dark:text-gray-500">{{ new Date(order.createdAt).toLocaleDateString('zh-TW') }}</p>
            <p class="text-xs text-stone-400 dark:text-gray-500 font-mono mt-0.5">{{ order.id }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <!-- 商品明細 -->
        <div class="px-5 py-4 space-y-1.5 text-sm text-stone-600 dark:text-gray-300">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between">
            <span>{{ item.bookTitle }} × {{ item.quantity }}</span>
            <span class="text-stone-400 dark:text-gray-500">NT$ {{ (item.unitPrice * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <!-- 收件資訊 + 合計 + 查看詳情 -->
        <div class="border-t border-gray-100 dark:border-gray-700 px-5 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div class="text-xs text-stone-400 dark:text-gray-500 space-y-0.5">
            <p><span class="text-stone-500 dark:text-gray-400 font-medium">收件人：</span>{{ order.recipientName }}・{{ order.recipientPhone }}</p>
            <p><span class="text-stone-500 dark:text-gray-400 font-medium">地址：</span>{{ order.shippingAddress }}</p>
            <p v-if="order.couponCode">
              <span class="text-stone-500 dark:text-gray-400 font-medium">折價券：</span>
              {{ order.couponCode }}（折抵 NT$ {{ order.discountAmount.toLocaleString() }}）
            </p>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <p class="font-bold text-amber-700 dark:text-amber-500">合計 NT$ {{ order.totalAmount.toLocaleString() }}</p>
            <button @click="router.push({ name: 'order-detail', params: { id: order.id } })"
              class="text-xs text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 border border-amber-300 dark:border-amber-700 hover:border-amber-500 px-3 py-1.5 rounded-lg transition">
              查看詳情
            </button>
          </div>
        </div>
      </div>
    </div>

    <Pagination v-if="meta" :meta="meta" @change="(p) => { page = p; fetchOrders() }" />
  </div>
</template>
