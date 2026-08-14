/**
 * 【檔案說明】
 * 書籍相關路由。
 *
 * 【端點總覽】
 * GET    /api/v1/books       → 取得書籍列表（public，支援分頁、篩選、搜尋）
 * GET    /api/v1/books/:id   → 取得單本書籍詳細資料（public）
 * POST   /api/v1/books       → 新增書籍（需登入 + 管理員）
 * PATCH  /api/v1/books/:id   → 更新書籍資料（需登入 + 管理員）
 * DELETE /api/v1/books/:id   → 刪除書籍（需登入 + 管理員，實際為軟刪除）
 *
 * 【權限設計說明】
 * - 瀏覽書籍不需要登入（讓訪客可以瀏覽商品）
 * - 管理書籍（新增/修改/刪除）需要 authenticate + adminOnly 雙重驗證
 *   先確認身份（是否登入），再確認角色（是否為管理員）
 *
 * 【為什麼用 PATCH 而不是 PUT？】
 * PUT 代表完整替換整個資源（所有欄位都要傳）
 * PATCH 代表部分更新（只傳要修改的欄位），更符合實際需求
 */
import { Router } from 'express'
import * as booksController from '../controllers/books'
import { authenticate } from '../middlewares/auth'
import { adminOnly } from '../middlewares/adminOnly'
import type { AuthRequest } from '../types/index'
import type { Response, NextFunction } from 'express'

const router = Router()

// 輔助型別轉換 wrapper，讓 TypeScript 接受 AuthRequest 型別的 middleware
const auth = (req: AuthRequest, res: Response, next: NextFunction) => authenticate(req, res, next)
const admin = (req: AuthRequest, res: Response, next: NextFunction) => adminOnly(req, res, next)

router.get('/', booksController.getBooks)                        // public
router.get('/:id', booksController.getBookById)                  // public
router.post('/', auth, admin, booksController.createBook)        // admin
router.patch('/:id', auth, admin, booksController.updateBook)    // admin
router.delete('/:id', auth, admin, booksController.deleteBook)   // admin

export default router
