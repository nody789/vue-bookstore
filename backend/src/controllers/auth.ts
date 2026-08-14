/**
 * 【檔案說明】
 * 身份驗證相關的 Controller（控制器）。
 *
 * 【架構角色】
 * Controller 是「請求的接收窗口」，負責：
 * 1. 從 request 中取出資料（req.body、req.params 等）
 * 2. 呼叫對應的 service 執行商業邏輯
 * 3. 把 service 回傳的結果送回給前端
 *
 * Controller 本身不包含商業邏輯，保持精簡。
 * 所有驗證邏輯在 parseZod 裡，所有商業邏輯在 service 裡。
 */
import type { Request, Response } from 'express'
import * as authService from '../services/auth'
import { registerSchema, loginSchema } from '../validators/auth'
import { sendSuccess } from '../utils/response'
import { parseZod } from '../utils/validate'

/**
 * 處理使用者註冊。
 * 端點：POST /api/v1/auth/register
 * 流程：驗證 body → 呼叫 authService.register → 回傳 { user, token }
 * 回傳 201（Created）表示資源建立成功。
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(registerSchema, req.body)
  const data = await authService.register(input)
  sendSuccess(res, data, 201)
}

/**
 * 處理使用者登入。
 * 端點：POST /api/v1/auth/login
 * 流程：驗證 body → 呼叫 authService.login → 回傳 { user, token }
 * 前端拿到 token 後需自行儲存（通常放在 memory 或 httpOnly Cookie）。
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(loginSchema, req.body)
  const data = await authService.login(input)
  sendSuccess(res, data)
}

/**
 * 處理使用者登出。
 * 端點：POST /api/v1/auth/logout
 * 因為 JWT 是 stateless（無狀態），後端不儲存 token，
 * 所以登出只需回傳成功，實際的 token 清除由前端負責（刪除本地儲存的 token）。
 */
export const logout = (_req: Request, res: Response): void => {
  sendSuccess(res, null)
}
