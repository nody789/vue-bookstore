/**
 * 【檔案說明】
 * multer 設定：接收前端上傳的圖片檔案。
 *
 * 【架構角色】
 * 放在需要上傳功能的路由前，負責解析 multipart/form-data，
 * 把檔案存進記憶體（buffer），供 controller 取出後送給 Cloudinary。
 *
 * 【為什麼用 memoryStorage 而不是 diskStorage？】
 * diskStorage 會先把檔案寫到伺服器磁碟，再讀出來傳給 Cloudinary，
 * 在無狀態的雲端部署（Render、Heroku）上磁碟是暫存的，可靠性差。
 * memoryStorage 直接存在 buffer 中，傳完就釋放，不留任何檔案。
 */
import multer from 'multer';
import { AppError } from '../types/index.js';
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 最大 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new AppError(400, 'VALIDATION_ERROR', '只能上傳圖片格式（jpg、png、webp 等）'));
        }
    },
});
