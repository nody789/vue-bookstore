/**
 * 【檔案說明】
 * 書籍相關的 Service（服務層）。
 *
 * 【架構角色】
 * 負責所有書籍的商業邏輯，包含：
 * - 分頁、篩選、關鍵字搜尋
 * - 書籍 CRUD
 * - 軟刪除（soft delete）：不真正刪除資料，只記錄刪除時間
 *
 * 所有資料庫操作透過 prisma，不直接寫 SQL。
 */
import { prisma } from '../lib/prisma'
import { AppError } from '../types/index'
import { getPaginationParams } from '../utils/response'
import type { CreateBookInput, UpdateBookInput } from '../validators/book'

/**
 * 書籍查詢參數的型別定義（從 query string 解析後的結構）。
 */
interface BookQuery {
  page?: string
  pageSize?: string
  categoryId?: string
  keyword?: string
  sortBy?: 'price' | 'createdAt'
  order?: 'asc' | 'desc'
}

/**
 * 取得書籍列表，支援分頁、分類篩選、關鍵字搜尋、自訂排序。
 *
 * 【商業邏輯說明】
 * - deletedAt: null 過濾掉已軟刪除的書籍
 * - keyword 搜尋同時比對書名（title）和作者（author），使用不分大小寫（insensitive）比對
 * - 使用 OR 條件讓搜尋更直覺：輸入一個關鍵字可以同時比對兩個欄位
 *
 * 【為什麼用 Promise.all 同時查詢？】
 * 列表查詢需要兩個資料庫請求：
 * 1. 查當頁的資料（findMany）
 * 2. 查總筆數（count，用來計算總頁數）
 * 用 Promise.all 讓兩個請求同時發出，而不是等第一個完成才發第二個，
 * 可以減少約一半的等待時間。
 */
export const getBooks = async (query: BookQuery) => {
  const { page, pageSize, skip, take } = getPaginationParams(query as Record<string, unknown>)

  // 組合篩選條件，使用展開運算子（...）根據是否有值來決定是否加入條件
  const where = {
    deletedAt: null,
    ...(query.categoryId && { categoryId: query.categoryId }),
    ...(query.keyword && {
      OR: [
        { title: { contains: query.keyword, mode: 'insensitive' as const } },
        { author: { contains: query.keyword, mode: 'insensitive' as const } },
      ],
    }),
  }

  const orderBy = {
    [query.sortBy || 'createdAt']: query.order || 'desc',
  }

  // 同時發出兩個查詢，節省總等待時間
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip,
      take,
      // include category 讓書籍回傳時附帶分類名稱，前端不需要再發一次請求
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.book.count({ where }),
  ])

  return { books, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

/**
 * 取得單本書籍詳細資料。
 *
 * 【商業邏輯】
 * where 條件同時限制 id 和 deletedAt: null，確保查不到已刪除的書籍，
 * 讓前端無法透過直接輸入 ID 來查看已下架的書籍。
 */
export const getBookById = async (id: string) => {
  const book = await prisma.book.findUnique({
    where: { id, deletedAt: null },
    include: { category: { select: { id: true, name: true } } },
  })
  if (!book) throw new AppError(404, 'NOT_FOUND', '書籍不存在')
  return book
}

/**
 * 建立新書籍。
 * input 的型別由 createBookSchema 推導，欄位都已驗證過，可以直接存入。
 */
export const createBook = async (input: CreateBookInput) => {
  return prisma.book.create({
    data: input,
    include: { category: { select: { id: true, name: true } } },
  })
}

/**
 * 更新書籍資料。
 *
 * 【為什麼要先 findUnique 再 update？】
 * Prisma 的 update 在找不到資料時會拋出例外，但錯誤訊息不是 AppError，
 * 無法被 errorHandler 正確處理。先 findUnique 確認書籍存在，
 * 不存在就手動拋出 AppError(404)，讓錯誤訊息更清楚。
 */
export const updateBook = async (id: string, input: UpdateBookInput) => {
  const book = await prisma.book.findUnique({ where: { id, deletedAt: null } })
  if (!book) throw new AppError(404, 'NOT_FOUND', '書籍不存在')

  return prisma.book.update({
    where: { id },
    data: input,
    include: { category: { select: { id: true, name: true } } },
  })
}

/**
 * 軟刪除書籍（設定 deletedAt，不真正從資料庫移除）。
 *
 * 【為什麼用軟刪除而不是真刪除？】
 * 已建立的訂單會參照書籍（雖然 OrderItem 存了 bookTitle 快照，但 bookId 仍是外鍵）。
 * 若真刪除書籍，可能導致訂單資料的關聯完整性問題。
 * 軟刪除讓書籍從前台消失（query 都有 deletedAt: null 條件），但資料庫仍保留記錄。
 */
export const deleteBook = async (id: string) => {
  const book = await prisma.book.findUnique({ where: { id, deletedAt: null } })
  if (!book) throw new AppError(404, 'NOT_FOUND', '書籍不存在')

  await prisma.book.update({ where: { id }, data: { deletedAt: new Date() } })
}
