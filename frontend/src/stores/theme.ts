// stores/theme.ts — Dark Mode 全域狀態
// isDark 持久化到 localStorage；init() 在 App.vue 啟動時呼叫，同步 <html> class
// Tailwind dark: variant 依賴 <html> 上的 dark class 觸發
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 預設讀取 localStorage，沒有紀錄時預設淺色
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // 切換深色/淺色，並同步寫入 localStorage 和 <html> class
  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // App.vue 啟動時呼叫一次，確保重整頁面後 class 立即同步（避免閃白）
  const init = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggle, init }
})
