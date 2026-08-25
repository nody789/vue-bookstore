/**
 * 【檔案說明】
 * 書籍分類相關的 Controller（控制器）。
 *
 * 【架構角色】
 * 接收分類操作請求，取出必要參數後交給 categoriesService 處理，
 * 保持 controller 精簡，不包含商業邏輯。
 */
import type { Request, Response } from 'express'
import * as categoriesService from '../services/categories.js'
import { createCategorySchema, updateCategorySchema } from '../validators/order.js'
import { sendSuccess } from '../utils/response.js'
import { parseZod } from '../utils/validate.js'

/**
 * 取得所有書籍分類。
 * 端點：GET /api/v1/categories
 * 不需要任何參數，回傳所有分類（依名稱排序）。
 * 前端用於渲染分類篩選選項。
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await categoriesService.getCategories()
  sendSuccess(res, categories)
}

/**
 * 建立新書籍分類（僅管理員）。
 * 端點：POST /api/v1/categories
 * body：{ name }
 * service 層會確認分類名稱不重複。
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name } = parseZod(createCategorySchema, req.body) as { name: string }
  const category = await categoriesService.createCategory(name)
  sendSuccess(res, category, 201)
}

/**
 * 更新分類名稱（僅管理員）。
 * 端點：PATCH /api/v1/categories/:id
 * body：{ name }（選填，但實際上必須傳才有意義）
 * service 層會確認新名稱不與現有分類重複。
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name } = parseZod(updateCategorySchema, req.body) as { name?: string }
  const category = await categoriesService.updateCategory(req.params['id'] as string, name!)
  sendSuccess(res, category)
}

/**
 * 刪除書籍分類（僅管理員）。
 * 端點：DELETE /api/v1/categories/:id
 * service 層會先確認分類下沒有書籍才允許刪除，
 * 防止刪除後書籍失去分類關聯，造成資料孤兒（orphan data）。
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await categoriesService.deleteCategory(req.params['id'] as string)
  sendSuccess(res, null)
}
