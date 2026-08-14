# DATABASE.md

## 資料庫類型

PostgreSQL

## 連線設定

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vue_bookstore
```

> 使用 Prisma 時只需 `DATABASE_URL`，其他欄位由 Prisma 管理

## 主鍵策略

| 情境 | 建議 | 原因 |
|------|------|------|
| 一般資料表 | `cuid()` | 避免 ID 被猜測，安全性較高 |
| 關聯 mapping 表 | 複合主鍵或自增 INT 皆可 | 依需求 |

> Prisma 寫法：`id String @id @default(cuid())`

## 軟刪除策略

需要保留刪除記錄的資料表（users、books、orders），使用軟刪除：

```
deletedAt  DateTime?   -- null 表示未刪除，有值表示已刪除
```

查詢時一律加上 `where: { deletedAt: null }`。

## 資料表說明

### users（使用者）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| email | String UNIQUE | 電子信箱 |
| name | String | 使用者名稱 |
| passwordHash | String | 雜湊後的密碼（bcrypt） |
| role | Enum | USER / ADMIN（預設 USER） |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |
| deletedAt | DateTime? | 軟刪除時間 |

### categories（書籍分類）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| name | String UNIQUE | 分類名稱（例：文學、商業、科技） |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |

### books（書籍）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| title | String | 書名 |
| author | String | 作者名稱 |
| categoryId | String FK | 關聯 categories.id |
| publisher | String? | 出版社 |
| isbn | String? UNIQUE | ISBN |
| description | String? | 書籍簡介 |
| price | Int | 售價（單位：元） |
| stock | Int | 庫存數量（>= 0） |
| coverImageUrl | String? | 封面圖片 URL |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |
| deletedAt | DateTime? | 軟刪除時間 |

### cartItems（購物車項目）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| userId | String FK | 關聯 users.id |
| bookId | String FK | 關聯 books.id |
| quantity | Int | 數量（>= 1） |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |

> 同一用戶同一本書只有一筆記錄，加入時若已存在則更新數量
> 複合唯一索引：`@@unique([userId, bookId])`

### orders（訂單）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| userId | String FK | 關聯 users.id |
| status | Enum | PENDING / PAID / SHIPPED / COMPLETED / CANCELLED |
| totalAmount | Int | 訂單總金額（單位：元） |
| recipientName | String | 收件人姓名 |
| recipientPhone | String | 收件人電話 |
| shippingAddress | String | 收件地址 |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |
| deletedAt | DateTime? | 軟刪除時間 |

### orderItems（訂單項目）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String CUID PK | 主鍵 |
| orderId | String FK | 關聯 orders.id |
| bookId | String FK | 關聯 books.id |
| bookTitle | String | 下單當時的書名（快照，防止書籍刪除後資料消失） |
| quantity | Int | 購買數量 |
| unitPrice | Int | 下單當時的單價（快照） |
| createdAt | DateTime | 建立時間 |

## 資料表關聯

```
users      1──N  orders
users      1──N  cartItems
orders     1──N  orderItems
books      1──N  cartItems
books      1──N  orderItems
categories 1──N  books
```

## 索引說明

| 資料表 | 欄位 | 原因 |
|--------|------|------|
| users | email | 登入時查詢頻繁 |
| books | categoryId | 依分類篩選書籍 |
| books | title | 關鍵字搜尋 |
| cartItems | userId, bookId | 複合唯一索引 |
| orders | userId | 查詢我的訂單 |
| orderItems | orderId | 查詢訂單明細 |

## 備註

- `orderItems.bookTitle` 和 `orderItems.unitPrice` 是下單時的快照，書籍資料之後修改不影響歷史訂單
- 購物車不設過期時間，登出後僅清空前端 Pinia，下次登入再從後端同步
- 庫存扣減在建立訂單時執行，並透過 Prisma transaction 確保一致性
