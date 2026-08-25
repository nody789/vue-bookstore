import { AppError } from '../types/index.js';
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        // 預期內的應用程式錯誤，用定義好的 statusCode 和 code 回傳
        const body = {
            success: false,
            code: err.code,
            message: err.message,
        };
        // errors 只有在表單欄位驗證失敗時才附帶（例如 Zod 驗證錯誤）
        if (err.errors)
            body['errors'] = err.errors;
        res.status(err.statusCode).json(body);
        return;
    }
    // 未預期的錯誤：印出完整 stack trace 讓開發者追查，對外只回傳通用訊息
    // 避免把內部錯誤細節（例如資料庫結構）暴露給使用者
    console.error(err);
    res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: '伺服器錯誤',
    });
};
