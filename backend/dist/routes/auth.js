/**
 * 【檔案說明】
 * 身份驗證相關路由。
 *
 * 【端點總覽】
 * POST /api/v1/auth/register  → 註冊新帳號（public，有嚴格 rate limit）
 * POST /api/v1/auth/login     → 登入取得 JWT Token（public，有嚴格 rate limit）
 * POST /api/v1/auth/logout    → 登出（public，JWT 是 stateless 所以後端不需做任何事）
 *
 * 【為什麼登入和註冊要設定額外的 rate limit？】
 * 全域 rate limit 是每分鐘 100 次，對一般瀏覽足夠，
 * 但登入端點面臨「暴力破解」風險：攻擊者可以用程式自動嘗試大量密碼組合。
 * 因此對這兩個端點單獨設定更嚴格的限制：15 分鐘內最多 10 次，
 * 超過就回傳 429 Too Many Requests，讓攻擊成本大幅提高。
 *
 * 【logout 為什麼不需要驗證？】
 * 本專案採用 JWT（stateless token）模式，Token 不存在伺服器端。
 * logout 的責任在前端：刪除本地儲存的 Token 即可。
 * 後端這個端點只是提供統一的介面，方便前端呼叫。
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.js';
const router = Router();
// 登入/註冊加嚴格 rate limit，防止暴力破解
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘的時間窗口
    max: 10, // 時間窗口內最多 10 次請求
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMIT_EXCEEDED', message: '請求過於頻繁，請稍後再試' },
});
router.post('/register', authLimiter, authController.register); // public
router.post('/login', authLimiter, authController.login); // public
router.post('/logout', authController.logout); // public（JWT stateless）
export default router;
