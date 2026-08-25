/**
 * 自訂的應用程式錯誤類別，繼承自 JavaScript 內建的 Error。
 *
 * 【為什麼要自訂 Error？】
 * 一般的 Error 只有 message，但 HTTP API 需要更多資訊來產生正確的回應：
 * - statusCode：HTTP 狀態碼（例如 404、401、409）
 * - code：機器可讀的錯誤代碼（例如 'NOT_FOUND'），前端用來判斷要顯示什麼訊息
 * - errors：表單欄位層級的錯誤（Zod 驗證失敗時使用）
 *
 * errorHandler middleware 會判斷 err instanceof AppError，
 * 如果是 AppError 就用結構化格式回傳，否則視為未預期的伺服器錯誤（500）。
 *
 * 【使用範例】
 * throw new AppError(404, 'NOT_FOUND', '書籍不存在')
 * throw new AppError(400, 'VALIDATION_ERROR', '格式錯誤', [{ field: 'email', message: '格式不正確' }])
 */
export class AppError extends Error {
    statusCode;
    code;
    errors;
    constructor(statusCode, code, message, errors) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.errors = errors;
        this.name = 'AppError';
    }
}
