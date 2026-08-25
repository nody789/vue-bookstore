/**
 * 【檔案說明】
 * 訂單與分類相關的 Zod 驗證 schema。
 *
 * 【為什麼分類的 schema 放在這個檔案？】
 * 歷史因素，分類的 schema 被定義在這裡。功能上沒有問題，
 * 未來可以考慮搬到 validators/category.ts 讓結構更清晰。
 *
 * 【欄位規則說明】
 *
 * createOrderSchema（建立訂單）：
 * - recipientName：收件人姓名，不可為空
 * - recipientPhone：收件人手機，必須符合台灣手機格式（09 開頭共 10 碼）
 * - shippingAddress：收件地址，不可為空
 * - couponCode：折價券代碼，選填；若有填寫，service 層會進行驗證
 *
 * updateOrderStatusSchema（更新訂單狀態）：
 * - status：訂單狀態，只允許以下五種值，代表訂單的生命週期：
 *   PENDING（待付款）→ PAID（已付款）→ SHIPPED（已出貨）→ COMPLETED（已完成）→ CANCELLED（已取消）
 *
 * createCategorySchema（建立分類）：
 * - name：分類名稱，不可為空（service 層會再確認名稱不重複）
 *
 * updateCategorySchema（更新分類）：
 * - 使用 .partial() 讓 name 變成選填（雖然實際上一定要填名稱才有意義）
 */
import { z } from 'zod';
export const createOrderSchema = z.object({
    recipientName: z.string().min(1, '收件人姓名不可為空'),
    // 正規表達式說明：^ 開頭、09 固定、\d{8} 後面 8 個數字、$ 結尾
    recipientPhone: z.string().regex(/^09\d{8}$/, '電話格式不正確'),
    shippingAddress: z.string().min(1, '收件地址不可為空'),
    couponCode: z.string().optional(),
});
export const updateOrderStatusSchema = z.object({
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
});
export const createCategorySchema = z.object({
    name: z.string().min(1, '分類名稱不可為空'),
});
export const updateCategorySchema = createCategorySchema.partial();
