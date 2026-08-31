# Vue Bookstore — 線上書店全端作品集

前後台分離的線上書店，前端 Vue3 + Pinia + TypeScript，後端 Node.js + Express + Prisma，包含完整購物流程與管理後台。

**Demo：** [部署連結（Render）](https://vue-bookstore.onrender.com)

---

## 功能一覽

### 前台（一般用戶）
- 書籍列表：分類篩選、關鍵字搜尋、分頁
- 書籍詳情頁：庫存顯示、加入購物車、同分類推薦
- 最近瀏覽：自動記錄，localStorage 持久化
- 購物車：數量調整、即時小計
- 結帳：折價券驗證、收件資訊表單
- 我的訂單：列表 + 詳情頁（狀態時間軸）
- 個人資料：姓名修改
- Dark Mode：一鍵切換，重整後保留設定

### 後台（管理員）
- 統計看板：書籍數、訂單數、營收、低庫存警示、最新訂單
- 書籍管理：新增 / 編輯 / 刪除（含封面圖）
- 訂單管理：狀態篩選、更新訂單狀態
- 折價券管理：百分比 / 固定金額、使用次數、到期日

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Vue3 + TypeScript + Tailwind CSS v4 + Pinia + Vue Router |
| 後端 | Node.js + Express + TypeScript + Prisma ORM |
| 資料庫 | PostgreSQL |
| 部署 | Render（前後端分離部署） |
| 測試 | Vitest + @vue/test-utils |

---

## 測試帳號

| 身份 | Email | 密碼 |
|------|-------|------|
| 管理員 | admin@bookstore.com | admin1234 |
| 一般會員 | user@bookstore.com | user1234 |

---

## 本地啟動

```bash
# 1. 後端
cd backend
cp .env.example .env        # 填入 DATABASE_URL、JWT_SECRET
npm install
npx prisma migrate dev       # 建立資料表
npx tsx prisma/seed.ts       # 填入測試資料（書籍、帳號、折價券）
npm run dev                  # http://localhost:8000

# 2. 前端
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

---

## 執行測試

```bash
cd frontend
npm test              # 監聽模式（開發時用）
npm run test:coverage # 產出覆蓋率報告
```

測試範圍：

| 測試檔 | 測試內容 |
|--------|----------|
| `stores.auth.test.ts` | 登入/登出、localStorage 同步、isAdmin 判斷 |
| `stores.cart.test.ts` | itemCount / total 計算、樂觀刪除、fetchCart |
| `stores.recentlyViewed.test.ts` | 去重、插頭排序、8 筆上限、持久化 |
| `stores.theme.test.ts` | Dark Mode 切換、html class 同步 |

---

## 折價券代碼（測試用）

| 代碼 | 類型 | 折扣 | 門檻 |
|------|------|------|------|
| WELCOME10 | 百分比 | 9 折 | 無 |
| SAVE100 | 固定金額 | 折抵 NT$100 | 滿 NT$500 |
| SUMMER20 | 百分比 | 8 折 | 無 |
| VIP15 | 百分比 | 85 折 | 滿 NT$1000 |

---

## 目錄結構

```
vue-bookstore/
├── frontend/
│   └── src/
│       ├── __tests__/     ← Vitest 測試
│       ├── components/ui/ ← 共用元件（BookCard、Pagination、StatusBadge）
│       ├── composables/   ← useToast
│       ├── layouts/       ← DefaultLayout、AdminLayout
│       ├── pages/
│       │   ├── store/     ← 前台頁面
│       │   └── admin/     ← 後台頁面
│       ├── router/        ← Vue Router + 路由守衛
│       ├── stores/        ← Pinia（auth / cart / theme / recentlyViewed）
│       └── types/         ← 全域 TypeScript 型別
└── backend/
    └── src/
        ├── controllers/   ← 接收 Request、回傳 Response
        ├── services/      ← 商業邏輯（Transaction、折扣計算）
        ├── middlewares/   ← JWT 驗證、adminOnly、errorHandler
        ├── validators/    ← Zod schema 輸入驗證
        └── routes/        ← API 路由定義
```

---

## 文件

```
docs/
├── API.md           ← API 端點列表與格式說明
├── DATABASE.md      ← 資料表結構與關聯
├── INTERVIEW.md     ← 面試問題與答法
└── FRONTEND_SKILLS.md ← 用這個專案說明技能的方式
```
