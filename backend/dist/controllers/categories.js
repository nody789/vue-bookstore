import * as categoriesService from '../services/categories.js';
import { createCategorySchema, updateCategorySchema } from '../validators/order.js';
import { sendSuccess } from '../utils/response.js';
import { parseZod } from '../utils/validate.js';
/**
 * 取得所有書籍分類。
 * 端點：GET /api/v1/categories
 * 不需要任何參數，回傳所有分類（依名稱排序）。
 * 前端用於渲染分類篩選選項。
 */
export const getCategories = async (_req, res) => {
    const categories = await categoriesService.getCategories();
    sendSuccess(res, categories);
};
/**
 * 建立新書籍分類（僅管理員）。
 * 端點：POST /api/v1/categories
 * body：{ name }
 * service 層會確認分類名稱不重複。
 */
export const createCategory = async (req, res) => {
    const { name } = parseZod(createCategorySchema, req.body);
    const category = await categoriesService.createCategory(name);
    sendSuccess(res, category, 201);
};
/**
 * 更新分類名稱（僅管理員）。
 * 端點：PATCH /api/v1/categories/:id
 * body：{ name }（選填，但實際上必須傳才有意義）
 * service 層會確認新名稱不與現有分類重複。
 */
export const updateCategory = async (req, res) => {
    const { name } = parseZod(updateCategorySchema, req.body);
    const category = await categoriesService.updateCategory(req.params['id'], name);
    sendSuccess(res, category);
};
/**
 * 刪除書籍分類（僅管理員）。
 * 端點：DELETE /api/v1/categories/:id
 * service 層會先確認分類下沒有書籍才允許刪除，
 * 防止刪除後書籍失去分類關聯，造成資料孤兒（orphan data）。
 */
export const deleteCategory = async (req, res) => {
    await categoriesService.deleteCategory(req.params['id']);
    sendSuccess(res, null);
};
