/**
 * 【檔案說明】
 * 訂單相關的 Service（服務層）。
 *
 * 【架構角色】
 * 這是整個後端最複雜的 service，負責處理「結帳」這個核心商業流程：
 * 1. 驗證購物車不為空
 * 2. 檢查所有商品庫存是否足夠
 * 3. 計算訂單金額（含折價券折扣）
 * 4. 在一個 transaction 中完成：建立訂單、扣庫存、清購物車、累計折價券使用次數
 *
 * 同時也負責訂單的查詢功能（使用者查自己的訂單、管理員查所有訂單）。
 */
import { prisma } from '../lib/prisma'
import { AppError } from '../types/index'
import { getPaginationParams } from '../utils/response'
import type { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order'

/**
 * 建立訂單（結帳核心邏輯）。
 *
 * 【商業邏輯流程】
 * 1. 讀取使用者購物車所有商品（含書籍詳細資訊）
 * 2. 檢查每本書的庫存是否足夠（不足就提前拋錯，不進 transaction）
 * 3. 計算原始金額（各商品 售價 × 數量 的總和）
 * 4. 若有折價券，驗證折價券並計算折扣
 * 5. 開啟 transaction 執行以下操作（原子性，全部成功或全部回滾）：
 *    a. 建立 Order 和所有 OrderItem（記錄當下的書名和售價快照）
 *    b. 扣減每本書的庫存（stock - quantity）
 *    c. 清空使用者的購物車
 *    d. 若有使用折價券，累計其 usedCount
 *
 * 【為什麼要用 transaction？】
 * 結帳涉及多個資料表的寫入操作。若中途失敗（例如網路斷線），
 * 不使用 transaction 可能導致：訂單建立了但庫存沒扣、或庫存扣了但訂單沒建立。
 * transaction 確保「全部成功」或「全部回滾到原始狀態」，保持資料一致性。
 *
 * 【為什麼 OrderItem 要存書名快照（bookTitle）？】
 * 若之後書籍名稱被修改或書籍被刪除，訂單商品仍能顯示下單當時的書名，
 * 保留完整的交易紀錄。
 */
export const createOrder = async (userId: string, input: CreateOrderInput) => {
  // 讀取購物車（含書籍詳細資訊，用於庫存確認和計算金額）
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { book: true },
  })
  if (cartItems.length === 0) throw new AppError(400, 'VALIDATION_ERROR', '購物車是空的')

  // 在 transaction 外預先確認庫存，可以提前拋錯，不用等進入 transaction 才發現問題
  for (const item of cartItems) {
    if (item.book.stock < item.quantity)
      throw new AppError(422, 'OUT_OF_STOCK', `《${item.book.title}》庫存不足`)
  }

  // 計算原始訂單金額
  const originalAmount = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  // 驗證折價券（若有提供）
  let discountAmount = 0
  let couponId: string | null = null

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } })

    // 在 transaction 外做折價券驗證，有問題可以提前回傳錯誤
    if (!coupon || !coupon.isActive)
      throw new AppError(400, 'INVALID_COUPON', '折價券不存在或已停用')
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      throw new AppError(400, 'COUPON_EXPIRED', '折價券已過期')
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      throw new AppError(400, 'COUPON_EXHAUSTED', '折價券已達使用上限')
    if (coupon.minAmount > 0 && originalAmount < coupon.minAmount)
      throw new AppError(400, 'ORDER_AMOUNT_TOO_LOW', `訂單金額需滿 NT$${coupon.minAmount.toLocaleString()}`)

    discountAmount =
      coupon.type === 'PERCENTAGE'
        ? Math.floor((originalAmount * coupon.value) / 100)
        : Math.min(coupon.value, originalAmount)

    couponId = coupon.id
  }

  const totalAmount = originalAmount - discountAmount

  // transaction：建立訂單 + 扣庫存 + 清購物車 + 累計折價券使用次數
  // prisma.$transaction 確保這四個操作要麼全部成功，要麼全部回滾
  const order = await prisma.$transaction(async (tx) => {
    // 建立訂單，同時建立所有訂單商品（nested create）
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        discountAmount,
        couponId,
        // 存折價券代碼字串而非只存外鍵，讓訂單即使折價券被刪除後仍能顯示代碼
        couponCode: input.couponCode?.toUpperCase() ?? null,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        shippingAddress: input.shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            bookId: item.bookId,
            bookTitle: item.book.title,  // 書名快照，防止書名修改後歷史訂單顯示錯誤
            quantity: item.quantity,
            unitPrice: item.book.price,  // 售價快照，防止日後調價影響歷史訂單金額
          })),
        },
      },
      include: { items: true },
    })

    // 依序扣減每本書的庫存（也可以用 Promise.all 並行，但順序執行較容易 debug）
    for (const item of cartItems) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // 清空購物車（結帳後購物車應該是空的）
    await tx.cartItem.deleteMany({ where: { userId } })

    // 累計折價券使用次數（讓下次檢查 maxUses 時能正確判斷）
    if (couponId) {
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
    }

    return newOrder
  })

  return order
}

/**
 * 取得使用者自己的訂單列表（分頁）。
 * where 條件限制 userId 確保只取自己的訂單，
 * deletedAt: null 排除軟刪除的訂單。
 */
export const getMyOrders = async (userId: string, query: Record<string, unknown>) => {
  const { page, pageSize, skip, take } = getPaginationParams(query)
  const where = { userId, deletedAt: null }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { items: true } }),
    prisma.order.count({ where }),
  ])

  return { orders, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

/**
 * 取得單筆訂單詳細資料。
 *
 * 【安全設計】
 * where 條件同時限制 orderId 和 userId，
 * 確保使用者 A 無法用訂單 ID 查看使用者 B 的訂單（IDOR 攻擊防護）。
 * 若訂單不存在或不屬於當前使用者，統一回傳 404（不透露訂單是否存在）。
 */
export const getOrderById = async (userId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, deletedAt: null },
    include: { items: true },
  })
  if (!order) throw new AppError(404, 'NOT_FOUND', '訂單不存在')
  return order
}

/**
 * 取得所有使用者的訂單（管理員後台用）。
 * 回傳訂單時附帶下訂者的基本資訊（id, email, name），
 * 讓管理員不需要另外查詢使用者資料。
 */
export const getAllOrders = async (query: Record<string, unknown>) => {
  const { page, pageSize, skip, take } = getPaginationParams(query)
  const where = { deletedAt: null }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        // 附帶下訂者基本資訊，只取必要欄位（不含 passwordHash 等敏感資料）
        user: { select: { id: true, email: true, name: true } },
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  return { orders, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } }
}

/**
 * 更新訂單狀態（管理員操作）。
 *
 * 【狀態流程】
 * PENDING（待付款）→ PAID（已付款）→ SHIPPED（已出貨）→ COMPLETED（已完成）
 *                                                        → CANCELLED（已取消）
 *
 * 目前後端不強制限制狀態的流轉方向（例如不限制 COMPLETED 改回 PENDING），
 * 若未來有需要可以在這裡加入狀態機（state machine）邏輯。
 */
export const updateOrderStatus = async (orderId: string, input: UpdateOrderStatusInput) => {
  const order = await prisma.order.findUnique({ where: { id: orderId, deletedAt: null } })
  if (!order) throw new AppError(404, 'NOT_FOUND', '訂單不存在')

  return prisma.order.update({ where: { id: orderId }, data: { status: input.status }, include: { items: true } })
}
