import { v2 as cloudinary } from 'cloudinary';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../types/index.js';
// 在模組載入時設定一次，之後每次呼叫都使用這份設定
cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: process.env['CLOUDINARY_API_KEY'],
    api_secret: process.env['CLOUDINARY_API_SECRET'],
});
/**
 * POST /api/v1/upload
 * 上傳圖片到 Cloudinary，回傳圖片的公開 URL。
 * 需要登入 + 管理員權限（在路由層設定）。
 */
export const uploadImage = async (req, res) => {
    if (!req.file) {
        throw new AppError(400, 'VALIDATION_ERROR', '請選擇要上傳的圖片');
    }
    // buffer → base64 data URI（cloudinary.uploader.upload 接受此格式）
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'vue-bookstore/covers',
        resource_type: 'image',
        // 圖片寬度限制 800px，Cloudinary 自動縮放，節省儲存空間和載入速度
        transformation: [{ width: 800, crop: 'limit' }],
    });
    sendSuccess(res, { url: result.secure_url });
};
