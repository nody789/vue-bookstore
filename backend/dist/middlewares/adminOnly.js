import { AppError } from '../types/index.js';
export const adminOnly = (req, _res, next) => {
    if (req.user?.role !== 'ADMIN') {
        throw new AppError(403, 'FORBIDDEN', '需要管理員權限');
    }
    next();
};
