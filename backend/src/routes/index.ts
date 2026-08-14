/**
 * 【檔案說明】
 * 路由總入口，負責把所有子路由組合在一起。
 *
 * 【架構角色】
 * 這個 router 被掛載在 index.ts 的 /api/v1 前綴下，
 * 所以每個子路由的完整路徑都是 /api/v1/<子路徑>。
 *
 * 【路由總覽】
 * /api/v1/auth        → 登入、註冊、登出
 * /api/v1/users       → 查詢／更新目前登入的使用者資料
 * /api/v1/books       → 書籍 CRUD（瀏覽公開，管理需登入+管理員）
 * /api/v1/categories  → 書籍分類 CRUD（瀏覽公開，管理需管理員）
 * /api/v1/cart        → 購物車操作（需登入）
 * /api/v1/orders      → 訂單建立與查詢（需登入）
 * /api/v1/coupons     → 折價券驗證（需登入）＋管理（需管理員）
 */
import { Router } from 'express'
import authRoutes from './auth'
import usersRoutes from './users'
import booksRoutes from './books'
import categoriesRoutes from './categories'
import cartRoutes from './cart'
import ordersRoutes from './orders'
import couponRoutes from './coupon'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/books', booksRoutes)
router.use('/categories', categoriesRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', ordersRoutes)
router.use('/coupons', couponRoutes)

export default router
