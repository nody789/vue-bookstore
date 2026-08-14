/**
 * 【檔案說明】
 * 提供統一的 HTTP 回應輔助函式。
 *
 * 【架構角色】
 * 讓所有 controller 用同一套方式送出回應，確保整個 API 的回應格式一致。
 * 格式統一後，前端只需要學一種格式就能處理所有 API 回應。
 *
 * 【回應格式】
 * 成功：       { success: true, data: ... }
 * 成功+分頁：  { success: true, data: [...], meta: { page, pageSize, total, totalPages } }
 * 失敗：由 errorHandler 處理，格式為 { success: false, code: ..., message: ... }
 */
import type { Response } from 'express'

/**
 * 分頁資訊結構。
 * 列表類 API 都會附帶這份 meta，讓前端知道目前在第幾頁、總共有幾筆。
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 送出成功回應（無分頁）。
 * @param res    Express 的 Response 物件
 * @param data   要回傳給前端的資料（任意型別）
 * @param status HTTP 狀態碼，預設 200；建立資源時傳 201
 */
export const sendSuccess = (res: Response, data: unknown, status = 200): void => {
  res.status(status).json({ success: true, data })
}

/**
 * 送出成功回應（含分頁 meta）。
 * 用於列表類 API，例如取得書籍列表、訂單列表。
 * @param res  Express 的 Response 物件
 * @param data 當頁的資料陣列
 * @param meta 分頁資訊（由 getPaginationParams 計算後傳入）
 */
export const sendPaginated = (res: Response, data: unknown[], meta: PaginationMeta): void => {
  res.status(200).json({ success: true, data, meta })
}

/**
 * 從 query string 解析分頁參數，並計算 skip（跳過幾筆）和 take（取幾筆）。
 *
 * 【為什麼要計算 skip / take？】
 * 資料庫分頁的做法是「跳過前幾筆，然後取接下來的幾筆」：
 * - 第 1 頁（pageSize=20）→ skip=0,  take=20（第 1~20 筆）
 * - 第 2 頁（pageSize=20）→ skip=20, take=20（第 21~40 筆）
 *
 * 【限制說明】
 * - page 最小為 1，防止負數或 0
 * - pageSize 最大為 100，防止一次查詢太多筆資料造成效能問題
 */
export const getPaginationParams = (query: Record<string, unknown>) => {
  const page = Math.max(1, Number(query['page']) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query['pageSize']) || 20))
  const skip = (page - 1) * pageSize
  return { page, pageSize, skip, take: pageSize }
}
