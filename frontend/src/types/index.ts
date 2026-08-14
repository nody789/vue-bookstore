// types/index.ts — 全域型別定義，對應後端 Prisma Schema

// ── 使用者 ─────────────────────────────────────────────────────────────

// 登入的使用者資訊，存在 auth store 和 localStorage
export interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'  // 角色決定能否進入後台（/admin）
}

// ── 書籍 ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string  // 例如：文學小說、商業理財、科技
}

// 完整書籍資料，從 /books 或 /books/:id 取得
export interface Book {
  id: string
  title: string
  author: string
  categoryId: string   // 外鍵，對應 Category.id
  category: Category   // 後端 join 後一起回傳的分類物件
  publisher: string | null  // 出版社（選填，null 代表未填）
  isbn: string | null
  description: string | null
  price: number        // 單位：台幣（整數）
  stock: number        // 庫存數量，0 代表售完
  coverImageUrl: string | null  // 封面圖片 URL，null 時改用 CSS 書封
  createdAt: string    // ISO 8601 格式，例如 "2026-01-01T00:00:00.000Z"
}

// ── 購物車 ─────────────────────────────────────────────────────────────

// book 欄位用 Pick 只取必要欄位，減少傳輸量
export interface CartItem {
  id: string
  bookId: string
  quantity: number
  book: Pick<Book, 'id' | 'title' | 'author' | 'price' | 'stock' | 'coverImageUrl'>
}

// ── 訂單 ───────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'

// bookTitle / unitPrice 是下訂當時的快照，不隨書籍資料變更而改變
export interface OrderItem {
  id: string
  bookId: string
  bookTitle: string   // 下訂當時的書名快照
  quantity: number
  unitPrice: number   // 下訂當時的單價快照（與 Book.price 可能不同）
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number    // 最終應付金額（含折扣後）
  discountAmount: number // 折價券折抵金額
  couponCode: string | null  // 使用的折價券代碼
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  createdAt: string
  items: OrderItem[]
  user?: Pick<User, 'id' | 'email' | 'name'>  // 後台查詢時才會有，前台查詢不含
}

// ── 折價券 ─────────────────────────────────────────────────────────────

// PERCENTAGE：百分比折扣（value=20 代表折 20%）；FIXED：固定金額折抵
export type CouponType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: string
  code: string           // 折價券代碼，英文大寫，例如 SUMMER20
  type: CouponType
  value: number          // 折扣值（PERCENTAGE 時為 1-100，FIXED 時為 NT$金額）
  minAmount: number      // 最低訂購金額門檻，0 代表無限制
  maxUses: number | null // 最大使用次數，null 代表無限制
  usedCount: number      // 已使用次數（後端自動計算）
  expiresAt: string | null  // 到期時間，null 代表永不過期
  isActive: boolean      // 是否啟用（管理員可手動停用）
  createdAt: string
}

// 折價券驗證結果：結帳頁套用折價券後後端回傳的折扣計算結果
export interface CouponValidateResult {
  coupon: Pick<Coupon, 'id' | 'code' | 'type' | 'value' | 'minAmount'>
  discountAmount: number  // 本次實際折抵金額
  finalAmount: number     // 折扣後應付金額
}

// ── 分頁 / API 格式 ────────────────────────────────────────────────────

// 後端列表回應附帶的分頁資訊，傳給 Pagination 元件
export interface PaginationMeta {
  page: number        // 目前頁碼（從 1 開始）
  pageSize: number    // 每頁幾筆
  total: number       // 總筆數
  totalPages: number  // 總頁數（= Math.ceil(total / pageSize)）
}

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiPaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}
