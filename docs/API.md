# API.md

## Base URL

```
開發環境：http://localhost:8000/api/v1
正式環境：https://（填入）/api/v1
```

> 版本號（v1）寫在 URL，未來破壞性更新升為 v2，不影響舊版用戶

## 認證方式

```
Authorization: Bearer <token>
```

> 公開端點（無需登入）標註 `public`
> 管理員端點需要 role = admin，標註 `admin`

## 統一回應格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

成功 + 分頁（列表類 API）：

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

失敗：

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "人類可讀的錯誤說明",
  "errors": [
    { "field": "email", "message": "格式不正確" }
  ]
}
```

> `errors` 陣列僅在表單驗證失敗（400）時提供

## 分頁查詢參數

列表類 API 統一使用以下 query string：

```
GET /books?page=1&pageSize=20
```

## API 端點列表

### 認證

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| POST | /auth/register | 一般用戶註冊 | public |
| POST | /auth/login | 登入（用戶 / 管理員共用） | public |
| POST | /auth/logout | 登出 | 需登入 |
| POST | /auth/refresh | 刷新 Token | public |

### 使用者

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| GET | /users/me | 取得當前使用者資訊 | 需登入 |
| PATCH | /users/me | 更新當前使用者資訊 | 需登入 |

### 書籍

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| GET | /books | 書籍列表（支援篩選、搜尋、分頁） | public |
| GET | /books/:id | 書籍詳情 | public |
| POST | /books | 新增書籍 | admin |
| PATCH | /books/:id | 更新書籍資訊 | admin |
| DELETE | /books/:id | 刪除書籍（軟刪除） | admin |

#### 書籍列表查詢參數

```
GET /books?page=1&pageSize=20&categoryId=xxx&keyword=vue&sortBy=createdAt&order=desc
```

| 參數 | 說明 |
|------|------|
| page | 頁碼（預設 1） |
| pageSize | 每頁筆數（預設 20） |
| categoryId | 依分類篩選 |
| keyword | 搜尋書名或作者名 |
| sortBy | 排序欄位（price / createdAt） |
| order | 排序方向（asc / desc） |

### 分類

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| GET | /categories | 所有分類列表 | public |
| POST | /categories | 新增分類 | admin |
| PATCH | /categories/:id | 更新分類 | admin |
| DELETE | /categories/:id | 刪除分類 | admin |

### 購物車

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| GET | /cart | 取得我的購物車 | 需登入 |
| POST | /cart/items | 加入購物車 | 需登入 |
| PATCH | /cart/items/:id | 更新購物車商品數量 | 需登入 |
| DELETE | /cart/items/:id | 移除購物車商品 | 需登入 |
| DELETE | /cart | 清空購物車 | 需登入 |

#### 加入購物車 Request Body

```json
{
  "bookId": "clxxx",
  "quantity": 2
}
```

### 訂單

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| POST | /orders | 建立訂單（從購物車結帳） | 需登入 |
| GET | /orders | 我的訂單列表 | 需登入 |
| GET | /orders/:id | 訂單詳情 | 需登入（本人） |

#### 建立訂單 Request Body

```json
{
  "recipientName": "王小明",
  "recipientPhone": "0912345678",
  "shippingAddress": "台北市信義區信義路五段7號"
}
```

### 後台 — 訂單管理

| Method | 路徑 | 說明 | 權限 |
|--------|------|------|------|
| GET | /admin/orders | 所有訂單列表（含篩選） | admin |
| PATCH | /admin/orders/:id/status | 更新訂單狀態 | admin |

#### 訂單狀態流程

```
pending → paid → shipped → completed
               ↘ cancelled（任何狀態皆可取消）
```

## 錯誤代碼

| HTTP Status | code | 說明 |
|-------------|------|------|
| 400 | VALIDATION_ERROR | 請求參數格式錯誤 |
| 401 | UNAUTHORIZED | 未登入或 Token 過期 |
| 403 | FORBIDDEN | 已登入但無此權限（非 admin） |
| 404 | NOT_FOUND | 資源不存在 |
| 409 | CONFLICT | 資源衝突（例如 email 已存在） |
| 422 | OUT_OF_STOCK | 書籍庫存不足 |
| 429 | RATE_LIMIT_EXCEEDED | 請求過於頻繁 |
| 500 | INTERNAL_ERROR | 伺服器錯誤 |

## 備註

- 購物車在用戶登入後從後端同步，登出後清空 Pinia store
- 建立訂單成功後自動清空購物車
- 書籍刪除為軟刪除，已購買的訂單仍可查到書名（快照於 order_items.book_title）
