/**
 * 【檔案說明】
 * 提供 Zod schema 驗證的輔助函式。
 *
 * 【架構角色】
 * 把「驗證失敗 → 拋出 AppError」的邏輯封裝起來，
 * 讓每個 controller 只需要一行就能完成驗證，不需要重複寫錯誤處理邏輯。
 *
 * 【為什麼用 Zod？】
 * Zod 同時做到兩件事：
 * 1. 資料驗證（例如 email 格式、密碼長度）
 * 2. TypeScript 型別推導（驗證通過後，data 就有正確的型別）
 * 這樣就不需要另外寫型別斷言（as SomeType）。
 */
import { AppError } from '../types/index.js';
/**
 * 驗證傳入的資料是否符合 Zod schema，驗證失敗時拋出 AppError。
 *
 * 【流程說明】
 * 1. 呼叫 schema.safeParse(body)，不會拋出例外，而是回傳 { success, data, error }
 * 2. 若驗證失敗，把 Zod 的錯誤訊息整理成 [{ field, message }] 格式
 * 3. 拋出 AppError(400)，errorHandler 會捕捉並送出標準錯誤回應
 * 4. 驗證成功則回傳已型別化的 data
 *
 * 【Zod v4 注意事項】
 * Zod v4 將 issue.path 改為 PropertyKey[]（包含 symbol），
 * 需用 map(String) 轉換為字串，才能組成像 "address.city" 這樣的欄位路徑。
 *
 * @param schema Zod schema 物件（例如 registerSchema）
 * @param body   要驗證的資料（通常是 req.body）
 * @returns 驗證通過後、具有正確型別的資料
 */
export const parseZod = (schema, body) => {
    const result = schema.safeParse(body);
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.map(String).join('.'),
            message: issue.message,
        }));
        throw new AppError(400, 'VALIDATION_ERROR', '請求參數格式錯誤', errors);
    }
    return result.data;
};
