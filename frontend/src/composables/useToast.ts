// composables/useToast.ts — 全域 toast 通知管理
// toasts 宣告在模組頂層（函式外），確保所有 useToast() 共用同一份陣列
import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number  // 用 id 精確定位刪除，避免同時多個 toast 時誤刪
  type: ToastType
  message: string
}

// 模組層級共享狀態，所有元件的 push/splice 都會觸發 ToastContainer 更新
const toasts = reactive<Toast[]>([])
let nextId = 0

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++nextId
    toasts.push({ id, type, message })
    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index !== -1) toasts.splice(index, 1)
    }, duration)
  }

  return {
    toasts,
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    warning: (msg: string) => show(msg, 'warning'),
    info: (msg: string) => show(msg, 'info'),
  }
}
