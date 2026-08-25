import * as usersService from '../services/users.js';
import { sendSuccess } from '../utils/response.js';
/**
 * 取得當前登入使用者的個人資料。
 * 端點：GET /api/v1/users/me
 * 使用者 ID 從 JWT Token 解析出的 req.user.id 取得，不需要前端傳 ID。
 * 回傳：{ id, email, name, role, createdAt }（不含 passwordHash）
 */
export const getMe = async (req, res) => {
    const user = await usersService.getMe(req.user.id);
    sendSuccess(res, user);
};
/**
 * 更新當前登入使用者的個人資料。
 * 端點：PATCH /api/v1/users/me
 * body：{ name?: string }（目前只支援修改姓名）
 * 不允許使用者自己修改 email 或 role（需要額外的驗證流程）。
 */
export const updateMe = async (req, res) => {
    const { name } = req.body;
    const user = await usersService.updateMe(req.user.id, { name });
    sendSuccess(res, user);
};
