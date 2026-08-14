/**
 * 【檔案說明】
 * 折價券相關路由。
 *
 * 【端點總覽】
 * POST   /api/v1/coupons/validate → 驗證折價券是否可用（需登入）
 * GET    /api/v1/coupons          → 取得所有折價券列表（需管理員）
 * POST   /api/v1/coupons          → 建立折價券（需管理員）
 * PATCH  /api/v1/coupons/:id      → 修改折價券狀態（啟用/停用）（需管理員）
 * DELETE /api/v1/coupons/:id      → 刪除折價券（需管理員）
 *
 * 【使用流程】
 * 使用者在結帳頁面輸入折價券代碼 → 前端呼叫 POST /validate 確認可用性與折扣金額
 * → 確認無誤後送出訂單（POST /orders，訂單 service 內部會再次驗證折價券）
 *
 * 【為什麼驗證和下單都要確認折價券？】
 * 防止「validate 時有效、下單時已被人搶先用完」的 race condition（競爭條件）。
 * 最終確認必須在建立訂單的 transaction 中進行。
 */
import { Router } from 'express'
import * as couponController from '../controllers/coupon'
import { authenticate } from '../middlewares/auth'
import { adminOnly } from '../middlewares/adminOnly'

const router = Router()

// 一般用戶：驗證折價券（需登入，防止未登入者探測有效的折價券代碼）
router.post('/validate', authenticate, couponController.validateCoupon)

// 管理員：折價券 CRUD
router.get('/',      authenticate, adminOnly, couponController.getCoupons)
router.post('/',     authenticate, adminOnly, couponController.createCoupon)
router.patch('/:id', authenticate, adminOnly, couponController.updateCoupon)
router.delete('/:id',authenticate, adminOnly, couponController.deleteCoupon)

export default router
