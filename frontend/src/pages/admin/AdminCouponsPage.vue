<script setup lang="ts">
// AdminCouponsPage — 後台折價券管理：列表、新增（摺疊表單）、啟停、刪除
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import { useToast } from '@/composables/useToast'
import type { Coupon } from '@/types'

const coupons = ref<Coupon[]>([])
const loading = ref(true)
// showForm：控制新增折價券表單的展開/收合
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')

const toast = useToast()

// type 需要型別斷言，避免 TypeScript 推斷為 string 而非 union type
const form = ref({
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  value: 10,
  minAmount: 0,
  maxUses: null as number | null,
  expiresAt: '',
})

const fetchCoupons = async () => {
  loading.value = true
  try {
    const res = await api.get('/coupons')
    coupons.value = res.data.data
  } finally {
    loading.value = false
  }
}

// maxUses / expiresAt 空值轉為 undefined，讓後端存為 null（代表無限制/永不過期）
const createCoupon = async () => {
  formError.value = ''
  submitting.value = true
  try {
    await api.post('/coupons', {
      ...form.value,
      maxUses: form.value.maxUses || undefined,    // 0 或 null → undefined
      expiresAt: form.value.expiresAt || undefined, // 空字串 → undefined
    })
    showForm.value = false
    form.value = { code: '', type: 'PERCENTAGE', value: 10, minAmount: 0, maxUses: null, expiresAt: '' }
    await fetchCoupons()
    toast.success('折價券建立成功')
  } catch (err: unknown) {
    formError.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '建立失敗'
  } finally {
    submitting.value = false
  }
}

// 停用保留歷史 usedCount，可追蹤行銷效果；toast 依操作前的狀態顯示
const toggleActive = async (coupon: Coupon) => {
  await api.patch(`/coupons/${coupon.id}`, { isActive: !coupon.isActive })
  await fetchCoupons()
  toast.success(coupon.isActive ? `${coupon.code} 已停用` : `${coupon.code} 已啟用`)
}

const deleteCoupon = async (coupon: Coupon) => {
  if (!confirm(`確定要刪除折價券「${coupon.code}」嗎？`)) return
  await api.delete(`/coupons/${coupon.id}`)
  await fetchCoupons()
  toast.success(`折價券 ${coupon.code} 已刪除`)
}

const typeLabel = (type: string) => type === 'PERCENTAGE' ? '百分比' : '固定金額'
const discountLabel = (coupon: Coupon) =>
  coupon.type === 'PERCENTAGE' ? `${coupon.value}% 折扣` : `NT$${coupon.value} 折抵`

onMounted(fetchCoupons)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-bold text-2xl text-stone-800">折價券管理</h1>
      <button @click="showForm = !showForm"
        class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm transition">
        {{ showForm ? '取消' : '+ 新增折價券' }}
      </button>
    </div>

    <!-- 新增表單 -->
    <div v-if="showForm" class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-semibold text-stone-700 mb-4">新增折價券</h2>
      <form @submit.prevent="createCoupon" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">折價券代碼（英文大寫）</label>
          <input v-model="form.code" type="text" required placeholder="例：SUMMER20"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">折扣類型</label>
          <select v-model="form.type"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="PERCENTAGE">百分比折扣（%）</option>
            <option value="FIXED">固定金額折抵（NT$）</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">
            折扣值（{{ form.type === 'PERCENTAGE' ? '1–100 的整數，如 20 = 八折' : 'NT$ 金額' }}）
          </label>
          <input v-model.number="form.value" type="number" required min="1" :max="form.type === 'PERCENTAGE' ? 100 : undefined"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">最低訂購金額（NT$，0 = 無限制）</label>
          <input v-model.number="form.minAmount" type="number" min="0"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">最大使用次數（留空 = 無限制）</label>
          <input v-model.number="form.maxUses" type="number" min="1" placeholder="無限制"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-stone-600 mb-1">到期日（留空 = 永不過期）</label>
          <input v-model="form.expiresAt" type="datetime-local"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <div class="col-span-2 flex items-center gap-3">
          <button type="submit" :disabled="submitting"
            class="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
            {{ submitting ? '建立中...' : '建立折價券' }}
          </button>
          <p v-if="formError" class="text-red-500 text-sm">{{ formError }}</p>
        </div>
      </form>
    </div>

    <!-- 折價券列表 -->
    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>
    <div v-else>
      <div v-if="coupons.length === 0" class="text-center py-20 text-stone-400">
        <p class="text-3xl mb-3">🎫</p>
        <p>尚無折價券，點右上角新增</p>
      </div>
      <table v-else class="w-full text-sm border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
        <thead>
          <tr class="bg-gray-50 text-stone-500 text-left text-xs font-medium uppercase tracking-wide">
            <th class="px-4 py-3">代碼</th>
            <th class="px-4 py-3">類型</th>
            <th class="px-4 py-3">折扣</th>
            <th class="px-4 py-3">門檻</th>
            <th class="px-4 py-3">使用次數</th>
            <th class="px-4 py-3">到期日</th>
            <th class="px-4 py-3">狀態</th>
            <th class="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-mono font-bold text-amber-700">{{ coupon.code }}</td>
            <td class="px-4 py-3 text-stone-600">{{ typeLabel(coupon.type) }}</td>
            <td class="px-4 py-3 font-semibold">{{ discountLabel(coupon) }}</td>
            <td class="px-4 py-3 text-stone-500">
              {{ coupon.minAmount > 0 ? `NT$${coupon.minAmount.toLocaleString()}` : '無限制' }}
            </td>
            <td class="px-4 py-3 text-stone-500">
              {{ coupon.usedCount }}
              <span v-if="coupon.maxUses" class="text-stone-400"> / {{ coupon.maxUses }}</span>
              <span v-else class="text-stone-400"> / ∞</span>
            </td>
            <td class="px-4 py-3 text-stone-500">
              {{ coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('zh-TW') : '永不過期' }}
            </td>
            <td class="px-4 py-3">
              <span :class="coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                class="px-2 py-0.5 rounded-full text-xs font-medium">
                {{ coupon.isActive ? '啟用中' : '已停用' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button @click="toggleActive(coupon)"
                  :class="coupon.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-emerald-600 hover:text-emerald-800'"
                  class="text-xs underline transition">
                  {{ coupon.isActive ? '停用' : '啟用' }}
                </button>
                <button @click="deleteCoupon(coupon)" class="text-red-400 hover:text-red-600 text-xs underline transition">
                  刪除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
