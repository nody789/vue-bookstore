/**
 * 【檔案說明】
 * 書籍分類相關路由。
 *
 * 【端點總覽】
 * GET    /api/v1/categories       → 取得所有分類（public）
 * POST   /api/v1/categories       → 新增分類（需登入 + 管理員）
 * PATCH  /api/v1/categories/:id   → 修改分類名稱（需登入 + 管理員）
 * DELETE /api/v1/categories/:id   → 刪除分類（需登入 + 管理員）
 *
 * 【權限設計】
 * 分類列表是公開的（前端篩選書籍時需要用）。
 * 管理分類只有管理員能操作，且刪除前 service 會確認該分類下沒有書籍。
 */
import { Router } from 'express'
import * as categoriesController from '../controllers/categories.js'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import type { AuthRequest } from '../types/index.js'
import type { Response, NextFunction } from 'express'

const router = Router()

const auth = (req: AuthRequest, res: Response, next: NextFunction) => authenticate(req, res, next)
const admin = (req: AuthRequest, res: Response, next: NextFunction) => adminOnly(req, res, next)

router.get('/', categoriesController.getCategories)                          // public
router.post('/', auth, admin, categoriesController.createCategory)           // admin
router.patch('/:id', auth, admin, categoriesController.updateCategory)       // admin
router.delete('/:id', auth, admin, categoriesController.deleteCategory)      // admin

export default router
