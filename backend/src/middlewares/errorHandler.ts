/**
 * 【檔案說明】
 * 全域錯誤處理 middleware（Error Handler）。
 *
 * 【架構角色】
 * 這是所有錯誤的「最終收口」，掛在 app.use(router) 之後。
 * 不論是 controller、service 還是 middleware 丟出的錯誤，
 * 只要沒有在中途被處理，都會流到這裡統一處理並回傳標準格式。
 *
 * 【為什麼用四個參數？】
 * Express 透過函式的參數數量來辨識這是「錯誤處理 middleware」。
 * 一般 middleware 是 (req, res, next)，
 * 錯誤處理 middleware 是 (err, req, res, next)，多了第一個 err 參數。
 *
 * 【兩種錯誤的處理方式】
 * 1. AppError（預期內的錯誤）：格式化後回傳，狀態碼由 AppError 決定
 *    例如：找不到書籍（404）、帳號密碼錯誤（401）
 * 2. 其他 Error（未預期的錯誤）：印出 log 供開發者追查，統一回傳 500
 *    例如：資料庫連線失敗、程式碼 bug
 *
 * 【回傳格式】
 * {
 *   success: false,
 *   code: 'NOT_FOUND',
 *   message: '書籍不存在',
 *   errors: [...] // 僅在表單驗證失敗時附帶
 * }
 */
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../types/index.js'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    // 預期內的應用程式錯誤，用定義好的 statusCode 和 code 回傳
    const body: Record<string, unknown> = {
      success: false,
      code: err.code,
      message: err.message,
    }
    // errors 只有在表單欄位驗證失敗時才附帶（例如 Zod 驗證錯誤）
    if (err.errors) body['errors'] = err.errors
    res.status(err.statusCode).json(body)
    return
  }

  // 未預期的錯誤：印出完整 stack trace 讓開發者追查，對外只回傳通用訊息
  // 避免把內部錯誤細節（例如資料庫結構）暴露給使用者
  console.error(err)
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: '伺服器錯誤',
  })
}
