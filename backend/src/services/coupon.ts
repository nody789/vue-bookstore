/**
 * 【檔案說明】
 * 折價券相關的 Service（服務層）。
 *
 * 【架構角色】
 * 負責折價券的商業邏輯，包含：
 * - 驗證折價券的各種有效性條件
 * - 計算折扣金額（支援百分比和固定金額兩種類型）
 * - 折價券 CRUD 管理
 */
import { prisma } from '../lib/prisma.js'
import { AppError } from '../types/index.js'
import type { CreateCouponInput, ValidateCouponInput, UpdateCouponInput } from '../validators/coupon.js'

/**
 * 取得所有折價券（管理員用），依建立時間降序排列。
 */
export const getCoupons = async () => {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
}

/**
 * 驗證折價券是否可用，並計算折扣金額。
 *
 * 【商業邏輯：驗證順序的設計】
 * 按照「最常發生的失敗」往前放，可以更快回傳錯誤，減少不必要的查詢：
 * 1. 折價券不存在或已停用（最常見）
 * 2. 已過期
 * 3. 已達使用次數上限
 * 4. 訂單金額未達門檻
 *
 * 【折扣計算說明】
 * - PERCENTAGE 百分比折扣：例如 value=10 代表打折 10%，折扣金額 = 訂單金額 × 10%
 *   Math.floor 取整數，避免出現小數金額
 * - FIXED 固定金額折扣：例如 value=100 代表折抵 100 元
 *   Math.min 確保折扣不超過訂單金額（不能折到負數）
 *
 * 【注意】
 * 這個函式只用於「預覽折扣」，下單時 orders service 內部會再驗證一次，
 * 兩次驗證確保資料一致性。
 */
export const validateCoupon = async ({ code, orderAmount }: ValidateCouponInput) => {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon || !coupon.isActive)
    throw new AppError(400, 'INVALID_COUPON', '折價券不存在或已停用')

  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw new AppError(400, 'COUPON_EXPIRED', '折價券已過期')

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    throw new AppError(400, 'COUPON_EXHAUSTED', '折價券已達使用上限')

  if (coupon.minAmount > 0 && orderAmount < coupon.minAmount)
    throw new AppError(400, 'ORDER_AMOUNT_TOO_LOW', `訂單金額需滿 NT$${coupon.minAmount.toLocaleString()} 才可使用`)

  const discountAmount =
    coupon.type === 'PERCENTAGE'
      ? Math.floor((orderAmount * coupon.value) / 100) // 百分比折扣，無條件捨去
      : Math.min(coupon.value, orderAmount)             // 固定折扣，但不超過訂單金額

  return {
    coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value, minAmount: coupon.minAmount },
    discountAmount,
    finalAmount: orderAmount - discountAmount,
  }
}

/**
 * 建立折價券。
 * code 已在 validator 層強制轉大寫（.toUpperCase()），這裡直接存入。
 * expiresAt 若有值，需從字串轉為 Date 物件再存入資料庫。
 */
export const createCoupon = async (input: CreateCouponInput) => {
  const exists = await prisma.coupon.findUnique({ where: { code: input.code } })
  if (exists) throw new AppError(409, 'CONFLICT', '折價券代碼已存在')

  return prisma.coupon.create({
    data: {
      ...input,
      // expiresAt 在 validator 層是字串（ISO 8601），需轉為 Date 物件存入資料庫
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  })
}

/**
 * 更新折價券（僅允許修改 isActive 啟用/停用狀態）。
 *
 * 【為什麼只允許修改 isActive？】
 * 若折價券已被部分使用者使用，修改折扣值或條件會影響公平性。
 * 想要修改折扣條件應建立新的折價券，並停用舊的。
 */
export const updateCoupon = async (id: string, input: UpdateCouponInput) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) throw new AppError(404, 'NOT_FOUND', '折價券不存在')

  return prisma.coupon.update({ where: { id }, data: input })
}

/**
 * 刪除折價券。
 * 刪除後歷史訂單的 couponCode 欄位（字串）不受影響，
 * 因為訂單儲存的是代碼文字，不是外鍵 ID。
 */
export const deleteCoupon = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } })
  if (!coupon) throw new AppError(404, 'NOT_FOUND', '折價券不存在')

  await prisma.coupon.delete({ where: { id } })
}
