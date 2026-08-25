/**
 * 【檔案說明】
 * 圖片上傳 Controller：接收圖片後上傳到 Cloudinary，回傳圖片 URL。
 *
 * 【流程說明】
 * 前端選取圖片 → multer 解析 multipart/form-data 存進 req.file.buffer
 * → 把 buffer 轉成 base64 data URI → 交給 Cloudinary SDK 上傳
 * → Cloudinary 回傳 secure_url → 回傳給前端填入書籍封面欄位
 *
 * 【為什麼用 data URI 而不是 upload_stream？】
 * upload_stream 需要 Node.js Stream 處理，程式碼較複雜。
 * data URI（base64）可以直接傳給 cloudinary.uploader.upload()，簡潔易讀，
 * 對 5MB 以內的圖片效能差異可以忽略。
 *
 * 【Cloudinary 設定從哪來？】
 * 從環境變數讀取（CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET），
 * 絕對不能寫在程式碼裡。
 */
import type { Request, Response } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { sendSuccess } from '../utils/response.js'
import { AppError } from '../types/index.js'

// 在模組載入時設定一次，之後每次呼叫都使用這份設定
cloudinary.config({
  cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
  api_key: process.env['CLOUDINARY_API_KEY'],
  api_secret: process.env['CLOUDINARY_API_SECRET'],
})

/**
 * POST /api/v1/upload
 * 上傳圖片到 Cloudinary，回傳圖片的公開 URL。
 * 需要登入 + 管理員權限（在路由層設定）。
 */
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError(400, 'VALIDATION_ERROR', '請選擇要上傳的圖片')
  }

  // buffer → base64 data URI（cloudinary.uploader.upload 接受此格式）
  const b64 = Buffer.from(req.file.buffer).toString('base64')
  const dataUri = `data:${req.file.mimetype};base64,${b64}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'vue-bookstore/covers',
    resource_type: 'image',
    // 圖片寬度限制 800px，Cloudinary 自動縮放，節省儲存空間和載入速度
    transformation: [{ width: 800, crop: 'limit' }],
  })

  sendSuccess(res, { url: result.secure_url })
}
