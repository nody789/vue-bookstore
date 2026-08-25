/**
 * 【檔案說明】
 * 購物車相關的 Service（服務層）。
 *
 * 【架構角色】
 * 負責購物車的商業邏輯，包含：
 * - 查詢使用者的購物車內容
 * - 新增商品（若已存在則累加數量）
 * - 修改數量、移除商品、清空購物車
 *
 * 所有操作都綁定 userId，確保使用者只能操作自己的購物車。
 */
import { prisma } from '../lib/prisma.js';
import { AppError } from '../types/index.js';
/**
 * 書籍資訊的 select 設定（只取前端需要的欄位，不回傳多餘資料）。
 * 定義成常數方便多個函式共用，避免重複撰寫相同的欄位清單。
 */
const bookSelect = {
    id: true,
    title: true,
    author: true,
    price: true,
    stock: true,
    coverImageUrl: true,
};
/**
 * 取得使用者的購物車內容。
 * 依加入時間升序排列（先加的先顯示），讓使用者看到穩定的排列順序。
 * include book 一次取出書籍資訊，避免 N+1 問題（對每個商品分別查一次書籍）。
 */
export const getCart = async (userId) => {
    return prisma.cartItem.findMany({
        where: { userId },
        include: { book: { select: bookSelect } },
        orderBy: { createdAt: 'asc' },
    });
};
/**
 * 新增商品到購物車。
 *
 * 【商業邏輯說明】
 * 先確認書籍存在（且未被刪除），再用 upsert 操作：
 * - 若購物車已有這本書（userId + bookId 組合唯一）→ 累加數量（increment）
 * - 若購物車沒有這本書 → 建立新的 CartItem
 *
 * 【為什麼用 upsert 而不是先查再判斷？】
 * upsert 是一個原子操作（atomic），不會有「查到沒有、但在 create 之前別人先 create 了」
 * 的競爭條件問題。一個操作完成所有事，更安全、更簡潔。
 */
export const addToCart = async (userId, input) => {
    const book = await prisma.book.findUnique({ where: { id: input.bookId, deletedAt: null } });
    if (!book)
        throw new AppError(404, 'NOT_FOUND', '書籍不存在');
    // upsert：用 userId_bookId 複合唯一鍵判斷是否已存在
    return prisma.cartItem.upsert({
        where: { userId_bookId: { userId, bookId: input.bookId } },
        create: { userId, bookId: input.bookId, quantity: input.quantity },
        update: { quantity: { increment: input.quantity } }, // 已存在則累加
        include: { book: { select: bookSelect } },
    });
};
/**
 * 更新購物車商品數量（設定為指定數量，非累加）。
 *
 * 【安全設計】
 * 查詢時同時帶 userId 條件：{ id: itemId, userId }
 * 確保使用者只能修改自己的購物車商品，無法修改其他使用者的 CartItem。
 */
export const updateCartItem = async (userId, itemId, input) => {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item)
        throw new AppError(404, 'NOT_FOUND', '購物車商品不存在');
    return prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: input.quantity }, // 直接設定新數量
        include: { book: { select: bookSelect } },
    });
};
/**
 * 從購物車移除單一商品。
 *
 * 【安全設計】
 * 同 updateCartItem，先確認 CartItem 屬於當前使用者，才執行刪除。
 */
export const removeCartItem = async (userId, itemId) => {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item)
        throw new AppError(404, 'NOT_FOUND', '購物車商品不存在');
    await prisma.cartItem.delete({ where: { id: itemId } });
};
/**
 * 清空使用者的購物車（刪除所有 CartItem）。
 * 結帳成功後，orders service 在 transaction 內會呼叫相同的 deleteMany 邏輯，
 * 這個函式供前端「手動清空購物車」功能使用。
 */
export const clearCart = async (userId) => {
    await prisma.cartItem.deleteMany({ where: { userId } });
};
