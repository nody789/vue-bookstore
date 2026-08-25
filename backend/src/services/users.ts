/**
 * 【檔案說明】
 * 使用者個人資料相關的 Service（服務層）。
 *
 * 【架構角色】
 * 負責使用者個人資料的查詢與更新商業邏輯。
 * 目前功能較單純：查詢和更新自己的資料。
 * 未來若有更換密碼、停用帳號等功能，也會加在這裡。
 */
import { prisma } from '../lib/prisma.js'
import { AppError } from '../types/index.js'

/**
 * 取得當前使用者的個人資料。
 *
 * 【設計說明】
 * select 明確列出要回傳的欄位，不回傳 passwordHash、deletedAt 等敏感或無用欄位。
 * 這是「最小資料原則」（principle of least data）：只回傳前端真正需要的資料。
 *
 * 雖然 authenticate middleware 已確認使用者存在（token 有效才能到這裡），
 * 但仍加上 deletedAt: null 防護，避免帳號在登入後被刪除、token 仍有效的邊緣情況。
 */
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  if (!user) throw new AppError(404, 'NOT_FOUND', '使用者不存在')
  return user
}

/**
 * 更新當前使用者的個人資料（目前只支援修改姓名）。
 *
 * 【設計說明】
 * data 參數型別是 { name?: string }，只允許修改姓名。
 * email、role 等欄位不在 data 型別內，TypeScript 會在編譯時阻止意外修改。
 *
 * 不做 exists 確認是因為此 API 要求登入才能使用，
 * 使用者 ID 來自 JWT Token，理論上一定存在（除非帳號在 token 有效期間被刪除）。
 */
export const updateMe = async (userId: string, data: { name?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, role: true },
  })
  return user
}
