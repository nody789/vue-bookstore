/**
 * 【檔案說明】
 * 身份驗證相關的 Zod 驗證 schema。
 *
 * 【架構角色】
 * 定義「什麼樣的資料才算有效的輸入」，在 controller 收到請求後、進入 service 前執行驗證。
 * 驗證通過後，Zod 會自動推導出正確的 TypeScript 型別，後面的程式碼直接使用，不需要再做斷言。
 *
 * 【欄位規則說明】
 *
 * registerSchema（註冊）：
 * - email：必須是合法的 Email 格式（例如 user@example.com）
 * - password：至少 8 個字元（足夠基礎的密碼強度要求）
 * - name：不可為空字串（確保有填姓名）
 *
 * loginSchema（登入）：
 * - email：合法 Email 格式
 * - password：只要有輸入即可（不重複做長度驗證，登入失敗讓 bcrypt 比對決定）
 */
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(8, '密碼至少 8 個字元'),
  name: z.string().min(1, '姓名不可為空'),
})

export const loginSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(1, '請輸入密碼'),
})

// z.infer 從 schema 自動推導出 TypeScript 型別，不需要手動重複定義
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
