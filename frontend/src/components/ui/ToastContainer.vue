<script setup lang="ts">
// ToastContainer — 全域通知容器，掛在 App.vue 確保路由切換後仍存在
// 【資料流】任何元件呼叫 toast.success() → toasts 陣列更新 → 渲染通知 → setTimeout 後自動消失
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
}

const styles: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-400 text-emerald-800',
  error:   'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-amber-50 border-amber-400 text-amber-800',
  info:    'bg-blue-50 border-blue-400 text-blue-800',
}

const iconStyles: Record<string, string> = {
  success: 'bg-emerald-400 text-white',
  error:   'bg-red-400 text-white',
  warning: 'bg-amber-400 text-white',
  info:    'bg-blue-400 text-white',
}
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 w-72">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-x-8"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-8"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg', styles[toast.type]]"
      >
        <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', iconStyles[toast.type]]">
          {{ icons[toast.type] }}
        </span>
        <span class="text-sm font-medium">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
