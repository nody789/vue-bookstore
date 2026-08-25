/**
 * 【檔案說明】
 * 圖片上傳路由。
 *
 * 【中介軟體執行順序】
 * authenticate → adminOnly → upload.single('image') → uploadImage
 *
 * 1. authenticate：驗證 JWT，確保已登入
 * 2. adminOnly：確保是管理員（一般用戶不能上傳書籍封面）
 * 3. upload.single('image')：multer 解析 multipart/form-data，
 *    欄位名稱必須是 'image'（前端 FormData.append('image', file) 要一致）
 * 4. uploadImage：把圖片送給 Cloudinary，回傳 URL
 */
import { Router } from 'express'
import { authenticate } from '../middlewares/auth.js'
import { adminOnly } from '../middlewares/adminOnly.js'
import { upload } from '../middlewares/upload.js'
import { uploadImage } from '../controllers/upload.js'

const router = Router()

// POST /api/v1/upload — admin only
router.post('/', authenticate, adminOnly, upload.single('image'), uploadImage)

export default router
