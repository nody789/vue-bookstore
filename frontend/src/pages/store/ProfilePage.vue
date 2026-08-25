<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const toast = useToast()

const loading = ref(true)
const saving = ref(false)

// 從 API 取回的完整使用者資料
const profile = ref({
  id: '',
  email: '',
  name: '',
  role: '',
  createdAt: '',
})

// 編輯表單只開放姓名修改，email 為唯讀
const name = ref('')
const isEditing = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/users/me')
    profile.value = res.data.data
    name.value = profile.value.name
  } catch {
    toast.error('無法載入個人資料')
  } finally {
    loading.value = false
  }
})

const startEdit = () => {
  name.value = profile.value.name
  isEditing.value = true
}

const cancelEdit = () => {
  name.value = profile.value.name
  isEditing.value = false
}

const handleSave = async () => {
  const trimmed = name.value.trim()
  if (!trimmed) {
    toast.error('姓名不能為空')
    return
  }
  saving.value = true
  try {
    const res = await api.patch('/users/me', { name: trimmed })
    profile.value.name = res.data.data.name
    // 同步 Pinia store，讓 Navbar 的姓名立即更新
    auth.updateUser({ name: res.data.data.name })
    isEditing.value = false
    toast.success('個人資料已更新')
  } catch {
    toast.error('更新失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}

const roleLabel: Record<string, string> = {
  USER: '一般會員',
  ADMIN: '管理員',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="max-w-2xl mx-auto py-8">
    <h1 class="text-2xl font-bold text-stone-800 mb-8">個人資料</h1>

    <div v-if="loading" class="text-center py-20 text-stone-400">載入中...</div>

    <div v-else class="space-y-6">
      <!-- 頭像 + 基本資訊卡片 -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-6">
        <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-2xl shrink-0">
          {{ profile.name?.charAt(0) }}
        </div>
        <div>
          <p class="text-lg font-semibold text-stone-800">{{ profile.name }}</p>
          <p class="text-sm text-stone-500 mt-0.5">{{ profile.email }}</p>
          <span class="inline-block mt-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            {{ roleLabel[profile.role] ?? profile.role }}
          </span>
        </div>
      </div>

      <!-- 詳細資料卡 -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-stone-700">帳號資訊</h2>
        </div>

        <div class="divide-y divide-gray-100">
          <!-- 姓名 -->
          <div class="px-6 py-5 flex items-start justify-between gap-4">
            <div class="flex-1">
              <p class="text-xs text-stone-400 mb-1">姓名</p>
              <div v-if="!isEditing" class="text-sm font-medium text-stone-800">{{ profile.name }}</div>
              <input v-else
                v-model="name"
                type="text"
                maxlength="50"
                class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div class="shrink-0 flex gap-2 pt-5">
              <template v-if="!isEditing">
                <button @click="startEdit"
                  class="text-sm text-amber-600 hover:text-amber-700 font-medium transition">
                  編輯
                </button>
              </template>
              <template v-else>
                <button @click="handleSave" :disabled="saving"
                  class="text-sm bg-amber-700 hover:bg-amber-800 text-white px-4 py-1.5 rounded-lg font-medium transition disabled:opacity-50">
                  {{ saving ? '儲存中...' : '儲存' }}
                </button>
                <button @click="cancelEdit" :disabled="saving"
                  class="text-sm text-stone-500 hover:text-stone-700 transition">
                  取消
                </button>
              </template>
            </div>
          </div>

          <!-- Email（唯讀） -->
          <div class="px-6 py-5">
            <p class="text-xs text-stone-400 mb-1">Email</p>
            <p class="text-sm text-stone-600">{{ profile.email }}</p>
            <p class="text-xs text-stone-400 mt-1">Email 目前不支援修改</p>
          </div>

          <!-- 帳號身份 -->
          <div class="px-6 py-5">
            <p class="text-xs text-stone-400 mb-1">帳號身份</p>
            <p class="text-sm text-stone-600">{{ roleLabel[profile.role] ?? profile.role }}</p>
          </div>

          <!-- 加入日期 -->
          <div class="px-6 py-5">
            <p class="text-xs text-stone-400 mb-1">加入日期</p>
            <p class="text-sm text-stone-600">{{ formatDate(profile.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- 快速連結 -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-stone-700">快速連結</h2>
        </div>
        <div class="divide-y divide-gray-100">
          <RouterLink to="/orders"
            class="flex items-center justify-between px-6 py-4 text-sm text-stone-700 hover:bg-amber-50 transition group">
            <span class="flex items-center gap-3">
              <span class="text-stone-400 group-hover:text-amber-600">📦</span>
              我的訂單
            </span>
            <span class="text-stone-300 group-hover:text-amber-500">›</span>
          </RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin"
            class="flex items-center justify-between px-6 py-4 text-sm text-stone-700 hover:bg-amber-50 transition group">
            <span class="flex items-center gap-3">
              <span class="text-stone-400 group-hover:text-amber-600">⚙️</span>
              後台管理
            </span>
            <span class="text-stone-300 group-hover:text-amber-500">›</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
