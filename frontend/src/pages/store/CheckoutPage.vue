<script setup lang="ts">
// CheckoutPage — 結帳頁面：訂單摘要、折價券驗證、收件資訊表單、送出訂單
// 【資料流】cart store → 計算金額 → POST /coupons/validate → POST /orders → 跳轉訂單頁
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import type { CouponValidateResult } from '@/types'

const router = useRouter()
const cart = useCartStore()
const toast = useToast()

// submitting：送出中按鈕 disabled，防止重複送出造成重複訂單
const submitting = ref(false)
// errors：後端 400 驗證錯誤，對應各欄位的紅字提示
const errors = ref<Record<string, string>>({})

// ── 折價券相關狀態 ─────────────────────────────────────────────────

const couponCode = ref('')
// couponResult：null 代表未套用，有值代表折價券已驗證並套用
const couponResult = ref<CouponValidateResult | null>(null)
const couponError = ref('')
const applyingCoupon = ref(false)

// .trim().toUpperCase()：去除空白、轉大寫，避免輸入錯誤
const applyCoupon = async () => {
  couponError.value = ''
  couponResult.value = null
  if (!couponCode.value.trim()) return

  applyingCoupon.value = true
  try {
    const res = await api.post('/coupons/validate', {
      code: couponCode.value.trim().toUpperCase(),
      orderAmount: cart.total,
    })
    couponResult.value = res.data.data
  } catch (err: unknown) {
    couponError.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '折價券無效'
  } finally {
    applyingCoupon.value = false
  }
}

const removeCoupon = () => {
  couponResult.value = null
  couponCode.value = ''
  couponError.value = ''
}

// 有折價券時用後端計算的 finalAmount，否則直接用購物車總金額
const finalTotal = computed(() =>
  couponResult.value ? couponResult.value.finalAmount : cart.total
)

// ── 收件資訊表單 ───────────────────────────────────────────────────

// form：統一管理收件資訊，送出時直接展開傳給 API
const form = ref({
  recipientName: '',
  recipientPhone: '',
  shippingAddress: '',
})

const submit = async () => {
  errors.value = {}
  submitting.value = true
  try {
    await api.post('/orders', {
      ...form.value,
      couponCode: couponResult.value?.coupon.code ?? undefined,
    })
    await cart.fetchCart()
    toast.success('訂單已成立！感謝您的購買')
    router.push('/orders')
  } catch (err: unknown) {
    const apiErrors = (err as { response?: { data?: { errors?: Array<{ field: string; message: string }> } } })?.response?.data?.errors
    if (apiErrors) {
      apiErrors.forEach(({ field, message }: { field: string; message: string }) => {
        errors.value[field] = message
      })
    } else {
      toast.error('下單失敗，請稍後再試')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="font-bold text-2xl text-stone-800 dark:text-gray-100 mb-6">結帳</h1>

    <!-- 訂單摘要 -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-5 shadow-sm">
      <h2 class="font-semibold text-stone-700 dark:text-gray-200 mb-3 text-sm">訂單摘要</h2>
      <div class="space-y-1.5 text-sm text-stone-600 dark:text-gray-300">
        <div class="flex justify-between">
          <span>商品小計（{{ cart.itemCount }} 件）</span>
          <span>NT$ {{ cart.total.toLocaleString() }}</span>
        </div>
        <div v-if="couponResult" class="flex justify-between text-emerald-600 dark:text-emerald-400">
          <span>折價券折扣（{{ couponResult.coupon.code }}）</span>
          <span>－ NT$ {{ couponResult.discountAmount.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between">
          <span>運費</span>
          <span :class="cart.total >= 599 ? 'text-emerald-600 dark:text-emerald-400' : ''">
            {{ cart.total >= 599 ? '免費' : 'NT$ 60' }}
          </span>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 flex justify-between font-bold text-stone-800 dark:text-gray-100 text-base">
          <span>應付金額</span>
          <span class="text-amber-700 dark:text-amber-500">NT$ {{ finalTotal.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- 折價券 -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-5 shadow-sm">
      <h2 class="font-semibold text-stone-700 dark:text-gray-200 mb-3 text-sm">折價券</h2>

      <!-- 已套用 -->
      <div v-if="couponResult"
        class="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg px-4 py-3">
        <div>
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{{ couponResult.coupon.code }}</p>
          <p class="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
            {{ couponResult.coupon.type === 'PERCENTAGE'
              ? `${couponResult.coupon.value}% 折扣，省 NT$${couponResult.discountAmount.toLocaleString()}`
              : `折抵 NT$${couponResult.discountAmount.toLocaleString()}` }}
          </p>
        </div>
        <button @click="removeCoupon" class="text-stone-400 dark:text-gray-500 hover:text-red-500 transition text-sm">✕ 移除</button>
      </div>

      <!-- 輸入框 -->
      <div v-else class="flex gap-2">
        <input v-model="couponCode" type="text" placeholder="輸入折價券代碼" @keyup.enter="applyCoupon"
          class="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100 placeholder:text-stone-400 dark:placeholder:text-gray-500" />
        <button @click="applyCoupon" :disabled="applyingCoupon || !couponCode.trim()"
          class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
          {{ applyingCoupon ? '驗證中...' : '套用' }}
        </button>
      </div>
      <p v-if="couponError" class="text-red-500 dark:text-red-400 text-xs mt-2">{{ couponError }}</p>
      <p class="text-stone-400 dark:text-gray-500 text-xs mt-2">試試：WELCOME10 / SAVE100 / SUMMER20 / VIP15</p>
    </div>

    <!-- 收件資訊 -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <h2 class="font-semibold text-stone-700 dark:text-gray-200 mb-4 text-sm">收件資訊</h2>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">收件人姓名</label>
          <input v-model="form.recipientName" type="text" required
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
            :class="errors['recipientName'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
          <p v-if="errors['recipientName']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors['recipientName'] }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">聯絡電話</label>
          <input v-model="form.recipientPhone" type="tel" required placeholder="09xxxxxxxx"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100 placeholder:text-stone-400 dark:placeholder:text-gray-500"
            :class="errors['recipientPhone'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
          <p v-if="errors['recipientPhone']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors['recipientPhone'] }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-gray-200 mb-1">收件地址</label>
          <input v-model="form.shippingAddress" type="text" required
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-stone-800 dark:text-gray-100"
            :class="errors['shippingAddress'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
          <p v-if="errors['shippingAddress']" class="text-red-500 dark:text-red-400 text-xs mt-1">{{ errors['shippingAddress'] }}</p>
        </div>

        <button type="submit" :disabled="submitting || cart.items.length === 0"
          class="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60 mt-2">
          {{ submitting ? '處理中...' : `確認下單 NT$${finalTotal.toLocaleString()}` }}
        </button>
      </form>
    </div>
  </div>
</template>
