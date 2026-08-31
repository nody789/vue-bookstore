import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'], ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 抓測試用戶、所有書籍、所有折價券
  const user = await prisma.user.findUnique({ where: { email: 'user@bookstore.com' } })
  if (!user) throw new Error('找不到 user@bookstore.com，請先執行 seed.ts')

  const books = await prisma.book.findMany({ where: { deletedAt: null } })
  if (books.length === 0) throw new Error('找不到書籍，請先執行 seed.ts')

  const coupons = await prisma.coupon.findMany({ where: { isActive: true } })
  const couponMap = Object.fromEntries(coupons.map((c) => [c.code, c]))

  // 收件人資料（輪流使用）
  const recipients = [
    { recipientName: '王小明', recipientPhone: '0912345678', shippingAddress: '台北市信義區信義路五段7號' },
    { recipientName: '李美玲', recipientPhone: '0923456789', shippingAddress: '台中市西區台灣大道二段2號' },
    { recipientName: '陳大偉', recipientPhone: '0934567890', shippingAddress: '高雄市苓雅區四維三路2號' },
    { recipientName: '林雅惠', recipientPhone: '0945678901', shippingAddress: '新北市板橋區縣民大道二段7號' },
    { recipientName: '張志豪', recipientPhone: '0956789012', shippingAddress: '台南市中西區中正路1號' },
  ]

  // 15 筆訂單設定：[書籍索引[], 數量[], 折價券代碼|null, 狀態]
  const orderPlans: Array<{
    bookIdxs: number[]
    quantities: number[]
    couponCode: string | null
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
    daysAgo: number
  }> = [
    { bookIdxs: [0, 4],   quantities: [1, 2], couponCode: null,       status: 'COMPLETED', daysAgo: 30 },
    { bookIdxs: [2],      quantities: [1],    couponCode: 'WELCOME10', status: 'COMPLETED', daysAgo: 25 },
    { bookIdxs: [12, 13], quantities: [2, 1], couponCode: 'SAVE100',   status: 'COMPLETED', daysAgo: 22 },
    { bookIdxs: [9],      quantities: [1],    couponCode: null,       status: 'COMPLETED', daysAgo: 20 },
    { bookIdxs: [16, 17], quantities: [1, 1], couponCode: 'SUMMER20',  status: 'SHIPPED',   daysAgo: 14 },
    { bookIdxs: [5],      quantities: [1],    couponCode: 'VIP15',     status: 'SHIPPED',   daysAgo: 12 },
    { bookIdxs: [1, 6],   quantities: [1, 1], couponCode: null,       status: 'SHIPPED',   daysAgo: 10 },
    { bookIdxs: [8],      quantities: [1],    couponCode: 'WELCOME10', status: 'PAID',      daysAgo: 7  },
    { bookIdxs: [3, 14],  quantities: [2, 1], couponCode: null,       status: 'PAID',      daysAgo: 6  },
    { bookIdxs: [11],     quantities: [1],    couponCode: 'SAVE100',   status: 'PAID',      daysAgo: 5  },
    { bookIdxs: [0, 12],  quantities: [1, 1], couponCode: 'SUMMER20',  status: 'PENDING',   daysAgo: 3  },
    { bookIdxs: [7],      quantities: [2],    couponCode: null,       status: 'PENDING',   daysAgo: 2  },
    { bookIdxs: [15, 16], quantities: [1, 1], couponCode: 'VIP15',     status: 'PENDING',   daysAgo: 1  },
    { bookIdxs: [4, 9],   quantities: [1, 1], couponCode: 'WELCOME10', status: 'CANCELLED', daysAgo: 18 },
    { bookIdxs: [19],     quantities: [1],    couponCode: null,       status: 'CANCELLED', daysAgo: 15 },
  ]

  let count = 0
  for (const [i, plan] of orderPlans.entries()) {
    const recipient = recipients[i % recipients.length]!
    const planBooks = plan.bookIdxs.map((idx) => books[idx % books.length]!)

    // 計算商品原始總金額
    const rawTotal = planBooks.reduce((sum, book, j) => sum + book.price * (plan.quantities[j] ?? 1), 0)

    // 套用折價券邏輯
    let discountAmount = 0
    let couponId: string | null = null
    const coupon = plan.couponCode ? couponMap[plan.couponCode] : null

    if (coupon && rawTotal >= coupon.minAmount) {
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = Math.floor(rawTotal * (coupon.value / 100))
      } else {
        discountAmount = Math.min(coupon.value, rawTotal)
      }
      couponId = coupon.id
      // 更新折價券使用次數
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    const totalAmount = rawTotal - discountAmount
    const createdAt = new Date(Date.now() - plan.daysAgo * 24 * 60 * 60 * 1000)

    await prisma.order.create({
      data: {
        userId: user.id,
        status: plan.status,
        totalAmount,
        discountAmount,
        couponId,
        couponCode: coupon && rawTotal >= (coupon.minAmount ?? 0) ? coupon.code : null,
        ...recipient,
        createdAt,
        items: {
          create: planBooks.map((book, j) => ({
            bookId: book.id,
            bookTitle: book.title,
            quantity: plan.quantities[j] ?? 1,
            unitPrice: book.price,
          })),
        },
      },
    })

    count++
    const couponInfo = coupon && rawTotal >= coupon.minAmount ? ` [${coupon.code} -NT$${discountAmount}]` : ''
    console.log(`  #${String(count).padStart(2, '0')} ${plan.status.padEnd(10)} NT$${String(totalAmount).padStart(5)}${couponInfo}`)
  }

  console.log(`\n✅ 新增 ${count} 筆測試訂單完成！`)
  console.log(`   用戶：user@bookstore.com / user1234`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
