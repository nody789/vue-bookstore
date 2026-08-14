/**
 * 【檔案說明】
 * JWT 身份驗證 middleware。
 *
 * 【架構角色】
 * 這是「守門員」。放在需要登入的路由前面，
 * 確認請求帶有有效的 JWT Token 才讓請求繼續往下走。
 *
 * 【通過後往下傳什麼？】
 * 驗證成功後，會把解析出的使用者資訊掛到 req.user：
 * {
 *   id: string,     // 使用者 ID
 *   email: string,  // 使用者 Email
 *   role: 'USER' | 'ADMIN'  // 角色，用於後續的權限判斷
 * }
 * 後面的 controller 就可以直接用 req.user!.id 取得當前使用者 ID。
 *
 * 【JWT 驗證流程】
 * 1. 從 Authorization Header 取出 Bearer Token
 * 2. 用 jose 函式庫驗證 Token 簽章與有效期
 * 3. 從 Token payload 取出使用者資料，掛到 req.user
 * 4. 呼叫 next() 讓請求繼續往下
 *
 * 【為什麼用 jose 而不是 jsonwebtoken？】
 * jose 是 ESM-only 的現代套件，支援 Web Crypto API，
 * 不依賴 Node.js 原生模組，可在 edge runtime 上執行。
 * 缺點是在 CommonJS 環境需用 dynamic import 載入。
 */
import type { Response, NextFunction } from 'express'
import { AppError, type AuthRequest } from '../types/index'

// 每次取得 secret 時才動態建立，確保都是讀取最新的環境變數值
const getSecret = () => new TextEncoder().encode(process.env['JWT_SECRET'] || 'fallback_secret')

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization

  // 必須帶 "Bearer <token>" 格式，否則直接拒絕
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', '請先登入')
  }

  // 去掉 "Bearer " 前綴，取出純 token 字串
  const token = authHeader.slice(7)

  try {
    // jose 是 ESM-only 套件，在 CJS 環境需使用 dynamic import
    const { jwtVerify } = await import('jose')

    // jwtVerify 同時驗證：簽章是否正確、token 是否過期
    const { payload } = await jwtVerify(token, getSecret())

    // 把 token 內的使用者資訊掛到 req.user，供後續 controller 使用
    req.user = {
      id: payload['userId'] as string,
      email: payload['email'] as string,
      role: payload['role'] as 'USER' | 'ADMIN',
    }
    next()
  } catch {
    // jwtVerify 拋出例外代表 token 無效或已過期
    throw new AppError(401, 'UNAUTHORIZED', 'Token 已過期，請重新登入')
  }
}
