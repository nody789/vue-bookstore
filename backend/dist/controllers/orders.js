import * as ordersService from '../services/orders.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { parseZod } from '../utils/validate.js';
/**
 * 建立訂單（結帳）。
 * 端點：POST /api/v1/orders
 * body：{ recipientName, recipientPhone, shippingAddress, couponCode? }
 * service 層會讀取購物車內容、驗證庫存、計算折扣，並在一個 transaction 中完成所有操作。
 * 成功後回傳新建立的訂單（含訂單商品明細）。
 */
export const createOrder = async (req, res) => {
    const input = parseZod(createOrderSchema, req.body);
    const order = await ordersService.createOrder(req.user.id, input);
    sendSuccess(res, order, 201);
};
/**
 * 取得當前使用者的訂單列表。
 * 端點：GET /api/v1/orders?page=1&pageSize=10
 * 只回傳屬於當前使用者的訂單，依建立時間降序排列。
 * 支援分頁，query string 傳入 page 和 pageSize。
 */
export const getMyOrders = async (req, res) => {
    const { orders, meta } = await ordersService.getMyOrders(req.user.id, req.query);
    sendPaginated(res, orders, meta);
};
/**
 * 取得單筆訂單詳細資料。
 * 端點：GET /api/v1/orders/:id
 * service 層會確認訂單的 userId 等於 req.user.id，
 * 防止使用者 A 用訂單 ID 查看使用者 B 的訂單。
 */
export const getOrderById = async (req, res) => {
    const order = await ordersService.getOrderById(req.user.id, req.params['id']);
    sendSuccess(res, order);
};
/**
 * 取得所有使用者的訂單（僅管理員）。
 * 端點：GET /api/v1/orders/admin?page=1&pageSize=20
 * 管理員後台用，回傳全部訂單，包含下訂者的基本資訊（id, email, name）。
 */
export const getAllOrders = async (req, res) => {
    const { orders, meta } = await ordersService.getAllOrders(req.query);
    sendPaginated(res, orders, meta);
};
/**
 * 更新訂單狀態（僅管理員）。
 * 端點：PATCH /api/v1/orders/admin/:id/status
 * body：{ status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' }
 * 管理員在後台手動更新訂單進度（例如標記已出貨）。
 */
export const updateOrderStatus = async (req, res) => {
    const input = parseZod(updateOrderStatusSchema, req.body);
    const order = await ordersService.updateOrderStatus(req.params['id'], input);
    sendSuccess(res, order);
};
