<script setup lang="ts">
// OrdersPage — 我的訂單列表（前台），後端依 JWT 自動篩選當前使用者的訂單
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Order, PaginationMeta } from '@/types'

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
    <h1 class="font-bold text-2xl text-stone-800 mb-6">我的訂單</h1>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>
    <div v-else-if="orders.length === 0" class="text-center py-20 text-stone-400">還沒有訂單</div>
    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id"
        class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs text-stone-400">{{ new Date(order.createdAt).toLocaleDateString('zh-TW') }}</p>
            <p class="text-xs text-stone-400 font-mono mt-0.5">{{ order.id }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <div class="space-y-1 text-sm text-stone-600">
          <p v-for="item in order.items" :key="item.id">
            {{ item.bookTitle }} × {{ item.quantity }}
            <span class="text-stone-400 ml-2">NT$ {{ (item.unitPrice * item.quantity).toLocaleString() }}</span>
          </p>
        </div>

        <div class="border-t border-gray-100 mt-3 pt-3 text-right">
          <span class="font-bold text-amber-700">合計 NT$ {{ order.totalAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <Pagination v-if="meta" :meta="meta" @change="(p) => { page = p; fetchOrders() }" />
  </div>
</template>
