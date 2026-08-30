// router/index.ts — 路由設定，定義路由表與全域守衛
// meta.requiresAuth / requiresAdmin / guestOnly 控制各頁面的進入條件
// 動態 import 實現 Lazy Loading，只有進入頁面才下載對應 JS
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 前台路由：父層是 DefaultLayout，子路由渲染在 Layout 的 RouterView
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/pages/store/HomePage.vue') },
        { path: 'books/:id', name: 'book-detail', component: () => import('@/pages/store/BookDetailPage.vue') },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('@/pages/store/CartPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: () => import('@/pages/store/CheckoutPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/pages/store/OrdersPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id',
          name: 'order-detail',
          component: () => import('@/pages/store/OrderDetailPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/store/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/pages/store/LoginPage.vue'),
          meta: { guestOnly: true },
        },
      ],
    },
    // 後台路由：父層設定 requiresAuth + requiresAdmin，子路由自動繼承
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/AdminDashboardPage.vue') },
        { path: 'books', name: 'admin-books', component: () => import('@/pages/admin/AdminBooksPage.vue') },
        { path: 'books/new', name: 'admin-book-new', component: () => import('@/pages/admin/AdminBookFormPage.vue') },
        { path: 'books/:id/edit', name: 'admin-book-edit', component: () => import('@/pages/admin/AdminBookFormPage.vue') },
        { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/AdminOrdersPage.vue') },
        { path: 'coupons', name: 'admin-coupons', component: () => import('@/pages/admin/AdminCouponsPage.vue') },
      ],
    },
    // 未知路徑導回首頁（404 fallback）
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// 全域路由守衛：每次切換頁面前執行權限檢查
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 未登入但頁面需要登入 → 跳轉登入頁，帶 redirect 讓登入後可返回
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 已登入但非管理員，卻要進入後台 → 跳轉首頁
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  // 已登入卻訪問登入頁（guestOnly）→ 跳轉首頁
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }
})

export default router
