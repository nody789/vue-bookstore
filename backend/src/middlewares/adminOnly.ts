/**
 * 【檔案說明】
 * 管理員權限驗證 middleware。
 *
 * 【架構角色】
 * 必須放在 authenticate middleware 之後使用（因為需要 req.user 資料）。
 * 用來保護只有 ADMIN 角色才能操作的端點，例如新增書籍、刪除分類、查看所有訂單等。
 *
 * 【驗證邏輯】
 * 檢查 req.user.role 是否為 'ADMIN'，不是就回傳 403 Forbidden。
 *
 * 【通過後往下傳什麼？】
 * 這個 middleware 不額外附加任何資料，
 * 單純確認角色後呼叫 next()，讓後面的 controller 執行。
 *
 * 【使用方式】
 * router.post('/books', authenticate, adminOnly, createBook)
 * 先 authenticate 確認身份 → 再 adminOnly 確認角色 → 最後才進 controller
 */
import type { Response, NextFunction } from 'express'
import { AppError, type AuthRequest } from '../types/index.js'

export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== 'ADMIN') {
    throw new AppError(403, 'FORBIDDEN', '需要管理員權限')
  }
  next()
}
