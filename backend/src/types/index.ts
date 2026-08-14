/**
 * 【檔案說明】
 * 定義整個後端共用的 TypeScript 型別與自訂錯誤類別。
 *
 * 【架構角色】
 * 集中管理型別定義，避免各檔案重複宣告相同結構。
 * 這裡有兩個重要角色：
 * 1. AuthRequest：擴充 Express 的 Request，讓 middleware 驗證後能把使用者資訊掛到 req 上
 * 2. AppError：標準化錯誤格式，配合 errorHandler 統一回傳錯誤 response
 */
import type { Request } from 'express'

/**
 * JWT 驗證後解析出來的使用者資訊。
 * authenticate middleware 驗證成功後，會把這份資料掛到 req.user。
 */
export interface AuthUser {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
}

/**
 * 擴充 Express 原本的 Request 型別，加入 user 欄位。
 *
 * 【為什麼要擴充 Request？】
 * Express 原生的 Request 沒有 user 屬性。
 * authenticate middleware 驗證 JWT 後，需要把解析出的使用者資訊往下傳給 controller，
 * 而 Express 的慣例是直接掛在 req 物件上（req.user）。
 * 用 interface 擴充可以讓 TypeScript 知道 req.user 的結構，享有型別提示和錯誤檢查。
 *
 * 【使用方式】
 * - 需要登入才能操作的 controller，把參數型別改成 AuthRequest
 * - 接著就可以安全地存取 req.user!.id 等資訊
 */
export interface AuthRequest extends Request {
  user?: AuthUser
}

/**
 * 自訂的應用程式錯誤類別，繼承自 JavaScript 內建的 Error。
 *
 * 【為什麼要自訂 Error？】
 * 一般的 Error 只有 message，但 HTTP API 需要更多資訊來產生正確的回應：
 * - statusCode：HTTP 狀態碼（例如 404、401、409）
 * - code：機器可讀的錯誤代碼（例如 'NOT_FOUND'），前端用來判斷要顯示什麼訊息
 * - errors：表單欄位層級的錯誤（Zod 驗證失敗時使用）
 *
 * errorHandler middleware 會判斷 err instanceof AppError，
 * 如果是 AppError 就用結構化格式回傳，否則視為未預期的伺服器錯誤（500）。
 *
 * 【使用範例】
 * throw new AppError(404, 'NOT_FOUND', '書籍不存在')
 * throw new AppError(400, 'VALIDATION_ERROR', '格式錯誤', [{ field: 'email', message: '格式不正確' }])
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
