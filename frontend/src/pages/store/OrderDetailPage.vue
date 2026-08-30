<script setup lang="ts">
// OrderDetailPage — 訂單詳情頁，顯示狀態時間軸、商品明細、收件資訊
// 【資料流】route.params.id → GET /orders/:id → order ref → 模板渲染
// 找不到訂單（404）或無權限（403）→ 跳回訂單列表
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { Order, OrderStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const order = ref<Order | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get(`/orders/${route.params['id']}`)
    order.value = res.data.data
  } catch {
    router.push('/orders')
  } finally {
    loading.value = false
  }
})

// 正常流程的步驟（CANCELLED 在模板中另外處理）
const statusSteps: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED']
const stepLabels: Record<OrderStatus, string> = {
  PENDING:   '待付款',
  PAID:      '已付款',
  SHIPPED:   '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

// 目前步驟 index：CANCELLED 回傳 -1，讓模板顯示取消狀態
const currentStepIndex = computed(() =>
  order.value ? statusSteps.indexOf(order.value.status) : -1
)

const isCancelled = computed(() => order.value?.status === 'CANCELLED')

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <button @click="router.push('/orders')"
      class="text-stone-500 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-500 mb-6 flex items-center gap-1 text-sm transition">
      ← 返回訂單列表
    </button>

    <div v-if="loading" class="text-center py-20 text-stone-400 dark:text-gray-500">載入中...</div>

    <div v-else-if="order" class="space-y-4">

      <!-- ── 訂單標頭 ── -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-xs text-stone-400 dark:text-gray-500 mb-1">
              下單時間：{{ formatDate(order.createdAt) }}
            </p>
            <p class="text-xs text-stone-400 dark:text-gray-500 font-mono">
              訂單編號：{{ order.id }}
            </p>
          </div>
          <StatusBadge :status="order.status" />
        </div>
      </div>

      <!-- ── 訂單進度時間軸 ── -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5">
        <h2 class="font-semibold text-stone-700 dark:text-gray-200 text-sm mb-6">訂單進度</h2>

        <!-- 已取消：特殊顯示 -->
        <div v-if="isCancelled"
          class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-semibold text-stone-700 dark:text-gray-200 text-sm">訂單已取消</p>
            <p class="text-xs text-stone-400 dark:text-gray-500 mt-0.5">此訂單已被取消，如有疑問請聯繫客服</p>
          </div>
        </div>

        <!-- 正常流程步驟條 -->
        <div v-else class="flex items-start">
          <template v-for="(step, i) in statusSteps" :key="step">
            <!-- 步驟圓點 + 標籤 -->
            <div class="flex flex-col items-center gap-2 shrink-0">
              <div :class="[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i <= currentStepIndex
                  ? 'bg-amber-700 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-stone-400 dark:text-gray-500'
              ]">
                <span v-if="i < currentStepIndex">✓</span>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <p :class="[
                'text-xs font-medium text-center leading-tight w-16',
                i <= currentStepIndex
                  ? 'text-amber-700 dark:text-amber-500'
                  : 'text-stone-400 dark:text-gray-500'
              ]">{{ stepLabels[step] }}</p>
            </div>
            <!-- 步驟連接線 -->
            <div v-if="i < statusSteps.length - 1"
              :class="[
                'flex-1 h-0.5 mt-[18px] mx-1',
                i < currentStepIndex ? 'bg-amber-700' : 'bg-gray-200 dark:bg-gray-600'
              ]" />
          </template>
        </div>
      </div>

      <!-- ── 商品明細 ── -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 class="font-semibold text-stone-700 dark:text-gray-200 text-sm">商品明細</h2>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-gray-700">
          <div v-for="item in order.items" :key="item.id"
            class="px-5 py-4 flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-stone-800 dark:text-gray-100 truncate">{{ item.bookTitle }}</p>
              <p class="text-xs text-stone-400 dark:text-gray-500 mt-0.5">
                NT$ {{ item.unitPrice.toLocaleString() }} × {{ item.quantity }}
              </p>
            </div>
            <p class="text-sm font-semibold text-stone-700 dark:text-gray-200 shrink-0">
              NT$ {{ (item.unitPrice * item.quantity).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- 金額小結 -->
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
          <div class="flex justify-between text-stone-600 dark:text-gray-300">
            <span>商品小計</span>
            <span>NT$ {{ (order.totalAmount + order.discountAmount).toLocaleString() }}</span>
          </div>
          <div v-if="order.couponCode" class="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>折價券（{{ order.couponCode }}）</span>
            <span>－ NT$ {{ order.discountAmount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between font-bold text-stone-800 dark:text-gray-100 text-base pt-2 border-t border-gray-200 dark:border-gray-600">
            <span>實付金額</span>
            <span class="text-amber-700 dark:text-amber-500">NT$ {{ order.totalAmount.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- ── 收件資訊 ── -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 class="font-semibold text-stone-700 dark:text-gray-200 text-sm">收件資訊</h2>
        </div>
        <div class="px-5 py-4 space-y-3 text-sm">
          <div class="flex gap-4">
            <span class="text-stone-400 dark:text-gray-500 shrink-0 w-16">收件人</span>
            <span class="text-stone-700 dark:text-gray-200 font-medium">{{ order.recipientName }}</span>
          </div>
          <div class="flex gap-4">
            <span class="text-stone-400 dark:text-gray-500 shrink-0 w-16">聯絡電話</span>
            <span class="text-stone-700 dark:text-gray-200">{{ order.recipientPhone }}</span>
          </div>
          <div class="flex gap-4">
            <span class="text-stone-400 dark:text-gray-500 shrink-0 w-16">收件地址</span>
            <span class="text-stone-700 dark:text-gray-200">{{ order.shippingAddress }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
