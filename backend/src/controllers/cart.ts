/**
 * 【檔案說明】
 * 購物車相關的 Controller（控制器）。
 *
 * 【架構角色】
 * 接收購物車操作請求，從 req.user（由 authenticate middleware 注入）取得使用者 ID，
 * 搭配請求參數呼叫 cartService，確保每個操作都綁定到正確的使用者。
 *
 * 【為什麼 controller 需要 AuthRequest？】
 * 購物車的所有操作都需要知道是哪個使用者，
 * 使用者 ID 存在 req.user.id（由 JWT 驗證後注入），
 * 所以 controller 的型別需要換成 AuthRequest 才能存取 req.user。
 */
import type { Response } from 'express'
import * as cartService from '../services/cart.js'
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.js'
import { type AuthRequest } from '../types/index.js'
import { sendSuccess } from '../utils/response.js'
import { parseZod } from '../utils/validate.js'

/**
 * 取得當前使用者的購物車內容。
 * 端點：GET /api/v1/cart
 * 回傳：購物車商品陣列（含書籍詳細資訊）。
 */
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await cartService.getCart(req.user!.id)
  sendSuccess(res, items)
}

/**
 * 新增商品到購物車。
 * 端點：POST /api/v1/cart/items
 * body：{ bookId, quantity }
 * 若購物車已有該書，service 層會累加數量（upsert）。
 */
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const input = parseZod(addToCartSchema, req.body)
  const item = await cartService.addToCart(req.user!.id, input)
  sendSuccess(res, item, 201)
}

/**
 * 更新購物車商品數量。
 * 端點：PATCH /api/v1/cart/items/:id
 * :id 是購物車項目（CartItem）的 ID，不是書籍 ID。
 * body：{ quantity }（設定為新的數量，非累加）。
 * service 層會驗證該 CartItem 屬於當前使用者。
 */
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const input = parseZod(updateCartItemSchema, req.body)
  const item = await cartService.updateCartItem(req.user!.id, req.params['id'] as string, input)
  sendSuccess(res, item)
}

/**
 * 移除購物車中的單一商品。
 * 端點：DELETE /api/v1/cart/items/:id
 * :id 是購物車項目（CartItem）的 ID。
 * service 層會驗證該 CartItem 屬於當前使用者（防止刪除別人的購物車商品）。
 */
export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  await cartService.removeCartItem(req.user!.id, req.params['id'] as string)
  sendSuccess(res, null)
}

/**
 * 清空整個購物車。
 * 端點：DELETE /api/v1/cart
 * 結帳成功後，orders service 內部也會呼叫此清空邏輯（在 transaction 中執行）。
 */
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  await cartService.clearCart(req.user!.id)
  sendSuccess(res, null)
}
