/**
 * 【檔案說明】
 * 書籍分類相關的 Service（服務層）。
 *
 * 【架構角色】
 * 負責分類的商業邏輯，包含：
 * - 確保分類名稱不重複
 * - 刪除前確認分類下無書籍（資料完整性保護）
 */
import { prisma } from '../lib/prisma'
import { AppError } from '../types/index'

/**
 * 取得所有書籍分類，依名稱升序排列（A→Z）。
 * 前端用於渲染分類下拉選單，排序讓使用者更容易找到目標分類。
 */
export const getCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}

/**
 * 建立新分類。
 *
 * 【商業邏輯】
 * 先確認名稱唯一（findUnique），重複就拋 409 Conflict，
 * 避免在資料庫層面才觸發 unique constraint 錯誤（資料庫錯誤訊息不友善）。
 */
export const createCategory = async (name: string) => {
  const exists = await prisma.category.findUnique({ where: { name } })
  if (exists) throw new AppError(409, 'CONFLICT', '分類名稱已存在')
  return prisma.category.create({ data: { name } })
}

/**
 * 更新分類名稱。
 *
 * 【商業邏輯】
 * 1. 確認分類存在
 * 2. 確認新名稱不與「其他分類」重複（NOT: { id } 排除自己，允許改成相同名稱）
 */
export const updateCategory = async (id: string, name: string) => {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError(404, 'NOT_FOUND', '分類不存在')

  // 確認名稱唯一，但排除自己本身（允許「改成和現在一樣的名稱」不報錯）
  const exists = await prisma.category.findFirst({ where: { name, NOT: { id } } })
  if (exists) throw new AppError(409, 'CONFLICT', '分類名稱已存在')

  return prisma.category.update({ where: { id }, data: { name } })
}

/**
 * 刪除分類。
 *
 * 【商業邏輯：為什麼要先確認書籍數量？】
 * 書籍的 categoryId 是外鍵（foreign key），若分類下還有書籍，
 * 直接刪除分類會導致：
 * - 觸發資料庫外鍵約束錯誤（若設定 restrict）
 * - 或讓書籍的 categoryId 變成 null（若設定 set null）
 * 兩種情況都不理想，所以在應用層先做檢查，給出明確的錯誤訊息，
 * 讓管理員知道要先處理書籍才能刪除分類。
 *
 * count 使用 deletedAt: null 排除已軟刪除的書籍，
 * 若分類下全是已刪除的書籍，允許刪除該分類。
 */
export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError(404, 'NOT_FOUND', '分類不存在')

  const bookCount = await prisma.book.count({ where: { categoryId: id, deletedAt: null } })
  if (bookCount > 0) throw new AppError(409, 'CONFLICT', '此分類下還有書籍，無法刪除')

  await prisma.category.delete({ where: { id } })
}
