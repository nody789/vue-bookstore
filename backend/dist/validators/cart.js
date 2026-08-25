/**
 * 【檔案說明】
 * 購物車操作相關的 Zod 驗證 schema。
 *
 * 【欄位規則說明】
 *
 * addToCartSchema（加入購物車）：
 * - bookId：書籍 ID，必填，不可為空字串
 * - quantity：數量，必填，必須為正整數（不能加入 0 本或負數）
 *   實際上要加幾本由前端決定，service 層會累加到現有數量上
 *
 * updateCartItemSchema（更新購物車商品數量）：
 * - quantity：新的數量，必須為正整數
 *   注意：這裡是「設定為」某個數量，而不是「增加」某個數量
 *   若要移除商品，應呼叫 DELETE /cart/items/:id
 */
import { z } from 'zod';
export const addToCartSchema = z.object({
    bookId: z.string().min(1, '書籍 ID 不可為空'),
    quantity: z.number().int().positive('數量必須為正整數'),
});
export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('數量必須為正整數'),
});
