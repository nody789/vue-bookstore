/**
 * 【檔案說明】
 * 購物車相關路由，所有端點都需要登入。
 *
 * 【端點總覽】
 * GET    /api/v1/cart           → 取得目前使用者的購物車內容
 * POST   /api/v1/cart/items     → 新增商品到購物車
 * PATCH  /api/v1/cart/items/:id → 修改購物車商品數量
 * DELETE /api/v1/cart/items/:id → 移除單一購物車商品
 * DELETE /api/v1/cart           → 清空購物車（結帳後自動呼叫）
 *
 * 【權限設計】
 * 所有端點都需要登入（authenticate），
 * service 層會再確認操作的 cartItem 屬於當前使用者，防止跨使用者存取。
 */
import { Router } from 'express'
import * as cartController from '../controllers/cart'
import { authenticate } from '../middlewares/auth'
import type { AuthRequest } from '../types/index'
import type { Response, NextFunction } from 'express'

const router = Router()

const auth = (req: AuthRequest, res: Response, next: NextFunction) => authenticate(req, res, next)

router.get('/', auth, (req, res) => cartController.getCart(req as AuthRequest, res))
router.post('/items', auth, (req, res) => cartController.addToCart(req as AuthRequest, res))
router.patch('/items/:id', auth, (req, res) => cartController.updateCartItem(req as AuthRequest, res))
router.delete('/items/:id', auth, (req, res) => cartController.removeCartItem(req as AuthRequest, res))
router.delete('/', auth, (req, res) => cartController.clearCart(req as AuthRequest, res))

export default router
