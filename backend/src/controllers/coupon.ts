/**
 * 【檔案說明】
 * 折價券相關的 Controller（控制器）。
 *
 * 【架構角色】
 * 接收折價券相關請求，驗證輸入格式後轉交 couponService 處理，
 * controller 本身不包含折扣計算邏輯。
 */
import type { Request, Response } from 'express'
import * as couponService from '../services/coupon.js'
import { createCouponSchema, validateCouponSchema, updateCouponSchema } from '../validators/coupon.js'
import { sendSuccess } from '../utils/response.js'
import { parseZod } from '../utils/validate.js'

/**
 * 取得所有折價券列表（僅管理員）。
 * 端點：GET /api/v1/coupons
 * 依建立時間降序排列，方便管理員查看最新建立的折價券。
 */
export const getCoupons = async (_req: Request, res: Response): Promise<void> => {
  const coupons = await couponService.getCoupons()
  sendSuccess(res, coupons)
}

/**
 * 驗證折價券是否可用（需登入）。
 * 端點：POST /api/v1/coupons/validate
 * body：{ code, orderAmount }
 * 回傳：{ coupon 基本資訊, discountAmount（折扣金額）, finalAmount（折後金額）}
 * 前端可以用這個結果在結帳頁面顯示折扣預覽，但實際下單時 orders service 還會再驗證一次。
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(validateCouponSchema, req.body)
  const result = await couponService.validateCoupon(input)
  sendSuccess(res, result)
}

/**
 * 建立新折價券（僅管理員）。
 * 端點：POST /api/v1/coupons
 * body：{ code, type, value, minAmount, maxUses?, expiresAt? }
 * service 層會確認代碼不重複，code 會被強制轉為大寫儲存。
 */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(createCouponSchema, req.body)
  const coupon = await couponService.createCoupon(input)
  sendSuccess(res, coupon, 201)
}

/**
 * 更新折價券狀態（僅管理員）。
 * 端點：PATCH /api/v1/coupons/:id
 * body：{ isActive: boolean }（只允許修改啟用/停用狀態）
 * 停用折價券不刪除，保留歷史紀錄。
 */
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(updateCouponSchema, req.body)
  const coupon = await couponService.updateCoupon(req.params['id'] as string, input)
  sendSuccess(res, coupon)
}

/**
 * 刪除折價券（僅管理員）。
 * 端點：DELETE /api/v1/coupons/:id
 * 若折價券已被使用過，刪除後歷史訂單的 couponCode 欄位仍保留代碼字串（非外鍵），
 * 所以不會影響已成立的訂單資料。
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  await couponService.deleteCoupon(req.params['id'] as string)
  sendSuccess(res, null)
}
