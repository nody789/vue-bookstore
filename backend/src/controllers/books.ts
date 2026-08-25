/**
 * 【檔案說明】
 * 書籍相關的 Controller（控制器）。
 *
 * 【架構角色】
 * 接收來自路由的請求，取出所需參數後交給 booksService 處理，
 * 最後把結果格式化後回傳給前端。Controller 本身不碰資料庫。
 */
import type { Request, Response } from 'express'
import * as booksService from '../services/books.js'
import { createBookSchema, updateBookSchema } from '../validators/book.js'
import { sendSuccess, sendPaginated } from '../utils/response.js'
import { parseZod } from '../utils/validate.js'

/**
 * 取得書籍列表（支援分頁、篩選、搜尋）。
 * 端點：GET /api/v1/books?page=1&pageSize=20&categoryId=xxx&keyword=xxx&sortBy=price&order=asc
 * 把 query string 原封不動傳給 service，service 內部處理篩選邏輯。
 * 回傳：書籍陣列 + 分頁 meta。
 */
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  const { books, meta } = await booksService.getBooks(req.query as Record<string, string>)
  sendPaginated(res, books, meta)
}

/**
 * 取得單本書籍詳細資料。
 * 端點：GET /api/v1/books/:id
 * 從路由參數取得書籍 ID（req.params.id），若不存在 service 會拋出 404。
 */
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  const book = await booksService.getBookById(req.params['id'] as string)
  sendSuccess(res, book)
}

/**
 * 新增書籍（僅管理員）。
 * 端點：POST /api/v1/books
 * 驗證 body 後呼叫 service 建立書籍，回傳 201 Created。
 */
export const createBook = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(createBookSchema, req.body)
  const book = await booksService.createBook(input)
  sendSuccess(res, book, 201)
}

/**
 * 更新書籍資料（僅管理員）。
 * 端點：PATCH /api/v1/books/:id
 * updateBookSchema 使用 .partial()，所以只需傳要修改的欄位。
 * 若書籍不存在 service 會拋出 404。
 */
export const updateBook = async (req: Request, res: Response): Promise<void> => {
  const input = parseZod(updateBookSchema, req.body)
  const book = await booksService.updateBook(req.params['id'] as string, input)
  sendSuccess(res, book)
}

/**
 * 刪除書籍（僅管理員）。
 * 端點：DELETE /api/v1/books/:id
 * 實際上是「軟刪除」（soft delete），只設定 deletedAt 時間戳，不真正從資料庫移除。
 * 這樣已成立的訂單仍可查到書籍歷史資料。
 * 成功後回傳 data: null。
 */
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  await booksService.deleteBook(req.params['id'] as string)
  sendSuccess(res, null)
}
