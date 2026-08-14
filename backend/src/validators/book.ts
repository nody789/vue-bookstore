/**
 * 【檔案說明】
 * 書籍相關的 Zod 驗證 schema。
 *
 * 【架構角色】
 * 管理員新增或修改書籍時，確保傳入的資料格式正確且完整。
 *
 * 【Schema 說明】
 *
 * createBookSchema（新增書籍）：
 * - title：書名，必填，不可為空
 * - author：作者，必填
 * - categoryId：分類 ID，必填（必須先有分類才能新增書籍）
 * - publisher：出版社，選填
 * - isbn：國際標準書號，選填
 * - description：書籍介紹，選填
 * - price：售價，必填，必須為正整數（不能是小數、不能是 0 或負數）
 * - stock：庫存數量，選填，最小為 0（不能負數），預設值為 0
 * - coverImageUrl：封面圖片網址，選填，但若有填必須是合法 URL 格式
 *
 * updateBookSchema（更新書籍）：
 * - 使用 .partial() 讓 createBookSchema 的所有欄位變成選填
 * - 這樣 PATCH 時只需要傳想修改的欄位，不需要傳所有欄位
 *
 * bookQuerySchema（查詢參數）：
 * - page / pageSize：分頁參數（從 query string 來，型別是字串，由 getPaginationParams 轉為數字）
 * - categoryId：依分類篩選
 * - keyword：關鍵字搜尋（同時搜尋書名和作者）
 * - sortBy：排序欄位，只允許 'price' 或 'createdAt'
 * - order：排序方向，只允許 'asc'（升序）或 'desc'（降序）
 */
import { z } from 'zod'

export const createBookSchema = z.object({
  title: z.string().min(1, '書名不可為空'),
  author: z.string().min(1, '作者不可為空'),
  categoryId: z.string().min(1, '分類不可為空'),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  description: z.string().optional(),
  price: z.number().int().positive('售價必須為正整數'),
  stock: z.number().int().min(0, '庫存不可為負數').default(0),
  coverImageUrl: z.string().url().optional(),
})

// .partial() 讓所有欄位變成選填，適合 PATCH 部分更新的情境
export const updateBookSchema = createBookSchema.partial()

export const bookQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  categoryId: z.string().optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>
