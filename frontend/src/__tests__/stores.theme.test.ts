// theme store 測試
// 【測試重點】toggle 切換深淺色、localStorage 持久化、<html> class 同步
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    // 重置 <html> class
    document.documentElement.classList.remove('dark')
  })

  it('預設：淺色模式（localStorage 沒有記錄）', () => {
    const theme = useThemeStore()
    expect(theme.isDark).toBe(false)
  })

  it('localStorage 有 dark → 初始化為深色模式', () => {
    localStorage.setItem('theme', 'dark')
    setActivePinia(createPinia())
    const theme = useThemeStore()
    expect(theme.isDark).toBe(true)
  })

  it('toggle → 切換 isDark', () => {
    const theme = useThemeStore()
    expect(theme.isDark).toBe(false)

    theme.toggle()
    expect(theme.isDark).toBe(true)

    theme.toggle()
    expect(theme.isDark).toBe(false)
  })

  it('toggle → 寫入 localStorage', () => {
    const theme = useThemeStore()
    theme.toggle()
    expect(localStorage.getItem('theme')).toBe('dark')

    theme.toggle()
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle → 同步 <html class="dark">', () => {
    const theme = useThemeStore()
    theme.toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    theme.toggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('init → 根據 isDark 同步 <html> class', () => {
    localStorage.setItem('theme', 'dark')
    setActivePinia(createPinia())
    const theme = useThemeStore()
    theme.init()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
