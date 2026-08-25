/**
 * 【檔案說明】
 * 折價券相關的 Zod 驗證 schema。
 *
 * 【欄位規則說明】
 *
 * createCouponSchema（建立折價券）：
 * - code：折價券代碼，最多 20 字，.toUpperCase() 自動轉大寫（統一儲存格式）
 * - type：折扣類型，只允許 'PERCENTAGE'（百分比折扣）或 'FIXED'（固定金額折扣）
 * - value：折扣值，正整數。PERCENTAGE 時代表百分比（例如 10 = 打九折），FIXED 時代表新台幣金額
 * - minAmount：使用門檻（訂單金額需達到此金額才能使用），最小為 0，預設 0（無門檻）
 * - maxUses：最大使用次數，選填；若未設定則無使用次數限制
 * - expiresAt：過期時間，ISO 8601 datetime 字串格式，選填；若未設定則永不過期
 *
 * validateCouponSchema（驗證折價券）：
 * - code：使用者輸入的折價券代碼
 * - orderAmount：訂單金額，用來計算折扣後的金額，以及確認是否達到使用門檻
 *
 * updateCouponSchema（更新折價券）：
 * - isActive：只允許修改啟用/停用狀態，其他欄位不開放修改（避免已使用的折價券被竄改）
 */
import { z } from 'zod';
export const createCouponSchema = z.object({
    code: z.string().min(1, '代碼不可為空').max(20, '代碼最多 20 字').toUpperCase(),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().int().positive('折扣值必須為正整數'),
    minAmount: z.number().int().min(0).default(0),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
});
export const validateCouponSchema = z.object({
    code: z.string().min(1, '請輸入折價券代碼'),
    orderAmount: z.number().int().positive(),
});
export const updateCouponSchema = z.object({
    isActive: z.boolean(),
});
