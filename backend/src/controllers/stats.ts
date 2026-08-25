import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { sendSuccess } from '../utils/response.js'

/**
 * GET /api/v1/stats
 * 後台統計看板資料，admin only。
 * 用 Promise.all 並行查詢避免串行等待。
 */
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const [
    totalBooks,
    totalOrders,
    revenueResult,
    pendingOrders,
    lowStockBooks,
    recentOrders,
  ] = await Promise.all([
    prisma.book.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.order.aggregate({
      where: { deletedAt: null },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: 'PENDING', deletedAt: null } }),
    prisma.book.count({ where: { stock: { lte: 5 }, deletedAt: null } }),
    prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } }, items: true },
    }),
  ])

  sendSuccess(res, {
    totalBooks,
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount ?? 0,
    pendingOrders,
    lowStockBooks,
    recentOrders,
  })
}
