import { AppError } from '../types/index.js';
// 每次取得 secret 時才動態建立，確保都是讀取最新的環境變數值
const getSecret = () => new TextEncoder().encode(process.env['JWT_SECRET'] || 'fallback_secret');
export const authenticate = async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    // 必須帶 "Bearer <token>" 格式，否則直接拒絕
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHORIZED', '請先登入');
    }
    // 去掉 "Bearer " 前綴，取出純 token 字串
    const token = authHeader.slice(7);
    try {
        // jose 是 ESM-only 套件，在 CJS 環境需使用 dynamic import
        const { jwtVerify } = await import('jose');
        // jwtVerify 同時驗證：簽章是否正確、token 是否過期
        const { payload } = await jwtVerify(token, getSecret());
        // 把 token 內的使用者資訊掛到 req.user，供後續 controller 使用
        req.user = {
            id: payload['userId'],
            email: payload['email'],
            role: payload['role'],
        };
        next();
    }
    catch {
        // jwtVerify 拋出例外代表 token 無效或已過期
        throw new AppError(401, 'UNAUTHORIZED', 'Token 已過期，請重新登入');
    }
};
