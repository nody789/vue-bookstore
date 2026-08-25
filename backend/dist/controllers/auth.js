import * as authService from '../services/auth.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { sendSuccess } from '../utils/response.js';
import { parseZod } from '../utils/validate.js';
/**
 * 處理使用者註冊。
 * 端點：POST /api/v1/auth/register
 * 流程：驗證 body → 呼叫 authService.register → 回傳 { user, token }
 * 回傳 201（Created）表示資源建立成功。
 */
export const register = async (req, res) => {
    const input = parseZod(registerSchema, req.body);
    const data = await authService.register(input);
    sendSuccess(res, data, 201);
};
/**
 * 處理使用者登入。
 * 端點：POST /api/v1/auth/login
 * 流程：驗證 body → 呼叫 authService.login → 回傳 { user, token }
 * 前端拿到 token 後需自行儲存（通常放在 memory 或 httpOnly Cookie）。
 */
export const login = async (req, res) => {
    const input = parseZod(loginSchema, req.body);
    const data = await authService.login(input);
    sendSuccess(res, data);
};
/**
 * 處理使用者登出。
 * 端點：POST /api/v1/auth/logout
 * 因為 JWT 是 stateless（無狀態），後端不儲存 token，
 * 所以登出只需回傳成功，實際的 token 清除由前端負責（刪除本地儲存的 token）。
 */
export const logout = (_req, res) => {
    sendSuccess(res, null);
};
