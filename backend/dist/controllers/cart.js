import * as cartService from '../services/cart.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.js';
import { sendSuccess } from '../utils/response.js';
import { parseZod } from '../utils/validate.js';
/**
 * 取得當前使用者的購物車內容。
 * 端點：GET /api/v1/cart
 * 回傳：購物車商品陣列（含書籍詳細資訊）。
 */
export const getCart = async (req, res) => {
    const items = await cartService.getCart(req.user.id);
    sendSuccess(res, items);
};
/**
 * 新增商品到購物車。
 * 端點：POST /api/v1/cart/items
 * body：{ bookId, quantity }
 * 若購物車已有該書，service 層會累加數量（upsert）。
 */
export const addToCart = async (req, res) => {
    const input = parseZod(addToCartSchema, req.body);
    const item = await cartService.addToCart(req.user.id, input);
    sendSuccess(res, item, 201);
};
/**
 * 更新購物車商品數量。
 * 端點：PATCH /api/v1/cart/items/:id
 * :id 是購物車項目（CartItem）的 ID，不是書籍 ID。
 * body：{ quantity }（設定為新的數量，非累加）。
 * service 層會驗證該 CartItem 屬於當前使用者。
 */
export const updateCartItem = async (req, res) => {
    const input = parseZod(updateCartItemSchema, req.body);
    const item = await cartService.updateCartItem(req.user.id, req.params['id'], input);
    sendSuccess(res, item);
};
/**
 * 移除購物車中的單一商品。
 * 端點：DELETE /api/v1/cart/items/:id
 * :id 是購物車項目（CartItem）的 ID。
 * service 層會驗證該 CartItem 屬於當前使用者（防止刪除別人的購物車商品）。
 */
export const removeCartItem = async (req, res) => {
    await cartService.removeCartItem(req.user.id, req.params['id']);
    sendSuccess(res, null);
};
/**
 * 清空整個購物車。
 * 端點：DELETE /api/v1/cart
 * 結帳成功後，orders service 內部也會呼叫此清空邏輯（在 transaction 中執行）。
 */
export const clearCart = async (req, res) => {
    await cartService.clearCart(req.user.id);
    sendSuccess(res, null);
};
