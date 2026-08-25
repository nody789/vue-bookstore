<script setup lang="ts">
// AdminOrdersPage — 後台訂單管理，顯示所有使用者訂單，可更改訂單狀態
// 打 /orders/admin（ADMIN 專用端點），前台 /orders 只回傳自己的訂單
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import { useToast } from '@/composables/useToast'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Order, OrderStatus, PaginationMeta } from '@/types'

const toast = useToast()

const orders = ref<Order[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(true)
const page = ref(1)

const statusOptions: { value: OrderStatus | ''; label: string }[] = [
  { value: 'PENDING',   label: '待付款' },
  { value: 'PAID',      label: '已付款' },
  { value: 'SHIPPED',   label: '配送中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/orders/admin', { params: { page: page.value } })
    orders.value = res.data.data
    meta.value = res.data.meta
  } finally {
    loading.value = false
  }
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: '待付款', PAID: '已付款', SHIPPED: '配送中', COMPLETED: '已完成', CANCELLED: '已取消',
}

const updateStatus = async (orderId: string, status: OrderStatus) => {
  await api.patch(`/orders/admin/${orderId}/status`, { status })
  toast.success(`訂單狀態已更新為「${statusLabels[status]}」`)
  await fetchOrders()
}

onMounted(fetchOrders)
</script>

<template>
  <div>
    <h1 class="font-bold text-2xl text-stone-800 mb-6">訂單管理</h1>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>
    <div v-else>
      <table class="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr class="bg-gray-100 text-stone-600 text-left">
            <th class="px-4 py-3 font-medium">訂單日期</th>
            <th class="px-4 py-3 font-medium">購買者</th>
            <th class="px-4 py-3 font-medium">商品</th>
            <th class="px-4 py-3 font-medium text-right">金額</th>
            <th class="px-4 py-3 font-medium">狀態</th>
            <th class="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 align-top">
            <td class="px-4 py-3 text-stone-500 whitespace-nowrap">
              {{ new Date(order.createdAt).toLocaleDateString('zh-TW') }}
            </td>
            <td class="px-4 py-3 text-stone-700">{{ order.user?.name }}</td>
            <td class="px-4 py-3 text-stone-500 text-xs">
              <p v-for="item in order.items" :key="item.id">{{ item.bookTitle }} × {{ item.quantity }}</p>
            </td>
            <td class="px-4 py-3 text-right text-amber-700 font-medium whitespace-nowrap">
              NT$ {{ order.totalAmount.toLocaleString() }}
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="order.status" />
            </td>
            <td class="px-4 py-3">
              <select :value="order.status"
                @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value as OrderStatus)"
                class="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination v-if="meta" :meta="meta" @change="(p) => { page = p; fetchOrders() }" />
    </div>
  </div>
</template>
