import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcrypt'

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'], ssl: { rejectUnauthorized: false } })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Open Library 封面圖 URL（免費公開，依 ISBN 取得）
const OL = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`

async function main() {
  // ── 分類 ──────────────────────────────────────────────────────────
  const [lit, biz, tech, psy, hist] = await Promise.all([
    prisma.category.upsert({ where: { name: '文學小說' }, update: {}, create: { name: '文學小說' } }),
    prisma.category.upsert({ where: { name: '商業理財' }, update: {}, create: { name: '商業理財' } }),
    prisma.category.upsert({ where: { name: '科技' },     update: {}, create: { name: '科技' } }),
    prisma.category.upsert({ where: { name: '心理勵志' }, update: {}, create: { name: '心理勵志' } }),
    prisma.category.upsert({ where: { name: '人文歷史' }, update: {}, create: { name: '人文歷史' } }),
  ])

  // ── 帳號 ──────────────────────────────────────────────────────────
  const [adminHash, userHash] = await Promise.all([bcrypt.hash('admin1234', 12), bcrypt.hash('user1234', 12)])
  await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@bookstore.com' }, update: {}, create: { email: 'admin@bookstore.com', name: '管理員', passwordHash: adminHash, role: 'ADMIN' } }),
    prisma.user.upsert({ where: { email: 'user@bookstore.com' },  update: {}, create: { email: 'user@bookstore.com',  name: '測試用戶', passwordHash: userHash,  role: 'USER'  } }),
  ])

  // ── 書籍（20 本，含 Open Library 封面） ───────────────────────────
  const books = [
    // 文學小說
    { title: '挪威的森林',       author: '村上春樹',                 categoryId: lit.id, price: 320,  stock: 50,  publisher: '時報出版',   description: '村上春樹代表作，一部關於青春、愛與失落的小說。',                            isbn: '9789571345826', coverImageUrl: OL('9789571345826') },
    { title: '百年孤寂',         author: '賈西亞‧馬奎斯',           categoryId: lit.id, price: 380,  stock: 30,  publisher: '皇冠出版',   description: '拉丁美洲魔幻寫實主義的巔峰之作，諾貝爾文學獎得主作品。',                    isbn: '9780060883287', coverImageUrl: OL('9780060883287') },
    { title: '1984',             author: 'George Orwell',           categoryId: lit.id, price: 299,  stock: 45,  publisher: '遠流出版',   description: '反烏托邦經典，描繪極權監控社會的驚世預言。',                                isbn: '9780451524935', coverImageUrl: OL('9780451524935') },
    { title: '小王子',           author: 'Antoine de Saint-Exupéry',categoryId: lit.id, price: 250,  stock: 100, publisher: '飛寶國際',   description: '超越時代的童話寓言，寫給所有曾是孩子的大人。',                              isbn: '9780156012195', coverImageUrl: OL('9780156012195') },
    // 商業理財
    { title: '零的法則',         author: 'Peter Thiel',             categoryId: biz.id, price: 350,  stock: 40,  publisher: '繁星多媒體', description: '從 0 到 1，顛覆舊有思維，打造獨佔市場的創業邏輯。',                         isbn: '9780804139298', coverImageUrl: OL('9780804139298') },
    { title: '原則',             author: 'Ray Dalio',               categoryId: biz.id, price: 680,  stock: 25,  publisher: '商業周刊',   description: '橋水基金創辦人歷時四十年打磨的生活與工作原則。',                            isbn: '9781501141294', coverImageUrl: OL('9781501141294') },
    { title: '富爸爸，窮爸爸',   author: 'Robert T. Kiyosaki',      categoryId: biz.id, price: 320,  stock: 70,  publisher: '高寶出版',   description: '改變數百萬人財務觀念的理財啟蒙經典。',                                      isbn: '9781612681122', coverImageUrl: OL('9781612681122') },
    { title: '獲利優先',         author: 'Mike Michalowicz',        categoryId: biz.id, price: 380,  stock: 35,  publisher: '商業周刊',   description: '翻轉傳統財務思維，讓小企業永遠保持獲利的實用方法。',                        isbn: '9781608322787', coverImageUrl: OL('9781608322787') },
    // 科技
    { title: '深度學習',         author: 'Ian Goodfellow',          categoryId: tech.id,price: 1200, stock: 20,  publisher: '碁峰資訊',   description: '深度學習領域最權威的教科書，從理論到實作全面涵蓋。',                        isbn: '9780262035613', coverImageUrl: OL('9780262035613') },
    { title: 'Clean Code',       author: 'Robert C. Martin',        categoryId: tech.id,price: 680,  stock: 35,  publisher: '博碩文化',   description: '寫出高品質程式碼的最佳實踐，每個工程師的必讀聖經。',                        isbn: '9780132350884', coverImageUrl: OL('9780132350884') },
    { title: '系統設計面試',     author: 'Alex Xu',                 categoryId: tech.id,price: 750,  stock: 28,  publisher: '博碩文化',   description: '拆解大型系統架構設計，掌握 FAANG 面試關鍵技巧。',                          isbn: null,            coverImageUrl: null },
    { title: '人工智慧：現代方法',author: 'Stuart Russell',          categoryId: tech.id,price: 1500, stock: 15,  publisher: '全華圖書',   description: 'AI 領域的百科全書，涵蓋搜尋、推理、學習與感知等核心主題。',                isbn: '9780136042594', coverImageUrl: OL('9780136042594') },
    // 心理勵志
    { title: '原子習慣',         author: 'James Clear',             categoryId: psy.id, price: 380,  stock: 80,  publisher: '方智出版',   description: '細微改變帶來巨大成就，建立好習慣、打破壞習慣的科學方法。',                  isbn: '9780735211292', coverImageUrl: OL('9780735211292') },
    { title: '心態致勝',         author: 'Carol S. Dweck',          categoryId: psy.id, price: 340,  stock: 55,  publisher: '天下文化',   description: '史丹佛大學心理學家揭示成長心態與固定心態的關鍵差異。',                    isbn: '9780345472328', coverImageUrl: OL('9780345472328') },
    { title: '被討厭的勇氣',     author: '岸見一郎',                categoryId: psy.id, price: 320,  stock: 90,  publisher: '究竟出版',   description: '阿德勒心理學的對話式入門，勇敢活出自己的人生哲學。',                      isbn: '9784478025819', coverImageUrl: OL('9784478025819') },
    { title: '當下的力量',       author: 'Eckhart Tolle',           categoryId: psy.id, price: 360,  stock: 40,  publisher: '橡實文化',   description: '超越思維的束縛，活在當下的靈性覺醒指南。',                                  isbn: '9781577314806', coverImageUrl: OL('9781577314806') },
    // 人文歷史
    { title: '人類大歷史',       author: 'Yuval Noah Harari',       categoryId: hist.id,price: 550,  stock: 60,  publisher: '天下文化',   description: '從狩獵採集到人工智慧，帶你重新認識人類這個物種的非凡旅程。',                isbn: '9780062316097', coverImageUrl: OL('9780062316097') },
    { title: '槍炮、病菌與鋼鐵', author: 'Jared Diamond',           categoryId: hist.id,price: 580,  stock: 38,  publisher: '時報出版',   description: '普立茲獎得獎作品，解答人類社會為何發展不平等的終極問題。',                  isbn: '9780393317558', coverImageUrl: OL('9780393317558') },
    { title: '文明的衝突',       author: 'Samuel Huntington',       categoryId: hist.id,price: 480,  stock: 22,  publisher: '聯經出版',   description: '冷戰後世界政治格局的奠基之作，預測文明間衝突的宏觀視野。',                  isbn: '9780684844411', coverImageUrl: OL('9780684844411') },
    { title: '大國的興衰',       author: 'Paul Kennedy',            categoryId: hist.id,price: 650,  stock: 18,  publisher: '聯經出版',   description: '從1500年到2000年，剖析大國崛起與衰落背後的經濟與軍事邏輯。',              isbn: '9780679720195', coverImageUrl: OL('9780679720195') },
  ]

  let created = 0
  let updated = 0
  for (const book of books) {
    const exists = await prisma.book.findFirst({ where: { title: book.title } })
    if (exists) {
      // 更新封面圖和 ISBN（首次執行 seed 後補充）
      await prisma.book.update({ where: { id: exists.id }, data: { isbn: book.isbn, coverImageUrl: book.coverImageUrl } })
      updated++
    } else {
      await prisma.book.create({ data: book })
      created++
    }
  }

  // ── 測試折價券 ────────────────────────────────────────────────────
  const coupons = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as const, value: 10, minAmount: 0,   maxUses: null, expiresAt: null, isActive: true },
    { code: 'SAVE100',   type: 'FIXED'      as const, value: 100,minAmount: 500,  maxUses: null, expiresAt: null, isActive: true },
    { code: 'SUMMER20',  type: 'PERCENTAGE' as const, value: 20, minAmount: 0,   maxUses: null, expiresAt: new Date('2026-12-31'), isActive: true },
    { code: 'VIP15',     type: 'PERCENTAGE' as const, value: 15, minAmount: 1000, maxUses: 50,  expiresAt: null, isActive: true },
  ]

  let couponCreated = 0
  for (const coupon of coupons) {
    const exists = await prisma.coupon.findUnique({ where: { code: coupon.code } })
    if (!exists) {
      await prisma.coupon.create({ data: coupon })
      couponCreated++
    }
  }

  console.log(`\nSeed 完成！`)
  console.log(`書籍：新增 ${created} 本，更新封面 ${updated} 本`)
  console.log(`折價券：新增 ${couponCreated} 組`)
  console.log(`\n帳號：`)
  console.log(`  管理員：admin@bookstore.com / admin1234`)
  console.log(`  用戶：  user@bookstore.com  / user1234`)
  console.log(`\n折價券代碼：`)
  console.log(`  WELCOME10 — 全單九折（無門檻）`)
  console.log(`  SAVE100   — 折抵 NT$100（滿 500 可用）`)
  console.log(`  SUMMER20  — 全單八折（2026年底前）`)
  console.log(`  VIP15     — 全單 85 折（限用 50 次）`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
