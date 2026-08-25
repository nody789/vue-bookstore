/**
 * 送出成功回應（無分頁）。
 * @param res    Express 的 Response 物件
 * @param data   要回傳給前端的資料（任意型別）
 * @param status HTTP 狀態碼，預設 200；建立資源時傳 201
 */
export const sendSuccess = (res, data, status = 200) => {
    res.status(status).json({ success: true, data });
};
/**
 * 送出成功回應（含分頁 meta）。
 * 用於列表類 API，例如取得書籍列表、訂單列表。
 * @param res  Express 的 Response 物件
 * @param data 當頁的資料陣列
 * @param meta 分頁資訊（由 getPaginationParams 計算後傳入）
 */
export const sendPaginated = (res, data, meta) => {
    res.status(200).json({ success: true, data, meta });
};
/**
 * 從 query string 解析分頁參數，並計算 skip（跳過幾筆）和 take（取幾筆）。
 *
 * 【為什麼要計算 skip / take？】
 * 資料庫分頁的做法是「跳過前幾筆，然後取接下來的幾筆」：
 * - 第 1 頁（pageSize=20）→ skip=0,  take=20（第 1~20 筆）
 * - 第 2 頁（pageSize=20）→ skip=20, take=20（第 21~40 筆）
 *
 * 【限制說明】
 * - page 最小為 1，防止負數或 0
 * - pageSize 最大為 100，防止一次查詢太多筆資料造成效能問題
 */
export const getPaginationParams = (query) => {
    const page = Math.max(1, Number(query['page']) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query['pageSize']) || 20));
    const skip = (page - 1) * pageSize;
    return { page, pageSize, skip, take: pageSize };
};
