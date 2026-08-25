/**
 * 【檔案說明】
 * 使用者個人資料相關路由，所有端點都需要登入。
 *
 * 【端點總覽】
 * GET   /api/v1/users/me → 取得目前登入使用者的個人資料
 * PATCH /api/v1/users/me → 更新目前登入使用者的個人資料（目前只支援修改姓名）
 *
 * 【設計說明】
 * 使用 /me 路由代表「目前登入的使用者」，避免使用 /users/:id 暴露使用者 ID，
 * 同時讓前端不需要知道自己的 ID 就能操作個人資料。
 * 使用者的 ID 從 JWT Token 解析後的 req.user.id 取得。
 */
import { Router } from 'express'
import * as usersController from '../controllers/users.js'
import { authenticate } from '../middlewares/auth.js'
import type { AuthRequest } from '../types/index.js'
import type { Response, NextFunction } from 'express'

const router = Router()

const auth = (req: AuthRequest, res: Response, next: NextFunction) => authenticate(req, res, next)

router.get('/me', auth, (req, res) => usersController.getMe(req as AuthRequest, res))
router.patch('/me', auth, (req, res) => usersController.updateMe(req as AuthRequest, res))

export default router
