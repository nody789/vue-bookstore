/**
 * 【檔案說明】
 * 訂單相關路由。
 *
 * 【端點總覽】
 * POST  /api/v1/orders              → 建立訂單（需登入；從購物車結帳）
 * GET   /api/v1/orders              → 取得目前使用者的訂單列表（需登入）
 * GET   /api/v1/orders/admin        → 取得所有使用者的訂單（需管理員）
 * GET   /api/v1/orders/:id          → 取得單筆訂單詳細資料（需登入）
 * PATCH /api/v1/orders/admin/:id/status → 更新訂單狀態（需管理員）
 *
 * 【注意路由順序】
 * /orders/admin 必須放在 /orders/:id 之前定義，
 * 否則 Express 會把 "admin" 當作 :id 的值來處理，導致路由錯誤。
 *
 * 【安全設計】
 * GET /orders/:id 雖然只需要登入，但 service 層會確認訂單的 userId 等於當前使用者的 id，
 * 防止使用者 A 用訂單 ID 查看使用者 B 的訂單資料。
 */
import { Router } from 'express'
import * as ordersController from '../controllers/orders.js'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import type { AuthRequest } from '../types/index.js'
import type { Response, NextFunction } from 'express'

const router = Router()

const auth = (req: AuthRequest, res: Response, next: NextFunction) => authenticate(req, res, next)
const admin = (req: AuthRequest, res: Response, next: NextFunction) => adminOnly(req, res, next)

router.post('/', auth, (req, res) => ordersController.createOrder(req as AuthRequest, res))
router.get('/', auth, (req, res) => ordersController.getMyOrders(req as AuthRequest, res))
router.get('/admin', auth, admin, (req, res) => ordersController.getAllOrders(req as AuthRequest, res))
router.get('/:id', auth, (req, res) => ordersController.getOrderById(req as AuthRequest, res))
router.patch('/admin/:id/status', auth, admin, (req, res) => ordersController.updateOrderStatus(req as AuthRequest, res))

export default router
