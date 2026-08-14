# PROJECT.md

## 專案名稱

Vue Bookstore（線上書店）

## 專案描述

一個前後台分離的線上書店，前台提供書籍瀏覽、購物車、結帳功能；後台提供管理員管理書籍與訂單。

## 專案目標

作為作品集專案，展示 Vue3 + Pinia + RESTful API 串接能力，以及前後台完整的系統開發能力。

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Vue3 + TypeScript + Tailwind CSS + Pinia + Vue Router |
| 後端 | Node.js + Express + TypeScript + Prisma |
| 資料庫 | PostgreSQL |
| 部署 | （填入） |

## 目錄結構

### 前端（Vue3 + Vite）

```
frontend/
├── src/
│   ├── assets/           ← 靜態資源（圖片、icon）
│   ├── components/       ← 共用 UI 元件（Button、Modal、Pagination）
│   ├── composables/      ← 共用 Composition API 邏輯（useAuth、useCart）
│   ├── layouts/          ← 頁面 Layout（DefaultLayout、AdminLayout）
│   ├── pages/            ← 頁面元件（對應路由）
│   │   ├── store/        ← 前台頁面（書籍列表、詳情、購物車、結帳）
│   │   └── admin/        ← 後台頁面（書籍管理、訂單管理）
│   ├── router/           ← Vue Router 路由設定（含路由守衛）
│   ├── stores/           ← Pinia store（auth、cart）
│   ├── lib/              ← axios instance、API 呼叫函式
│   ├── types/            ← 共用 TypeScript 型別
│   └── utils/            ← 純函式工具
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

### 後端（Node.js + Express）

```
backend/
├── src/
│   ├── routes/           ← 路由定義（只定義路徑與 controller）
│   ├── controllers/      ← 接收 Request、回傳 Response
│   ├── services/         ← 商業邏輯（不直接碰 req/res）
│   ├── middlewares/      ← auth、error handler、rate limit
│   ├── validators/       ← Zod schema 驗證
│   ├── types/            ← 共用 TypeScript 型別
│   └── utils/            ← 純函式工具
├── prisma/
│   └── schema.prisma     ← 資料庫結構定義
├── .env.example
└── package.json
```

## 開發環境設置

```bash
# 後端
cd backend
npm install
npm run dev       # 啟動於 http://localhost:8000

# 前端
cd frontend
npm install
npm run dev       # 啟動於 http://localhost:5173
```

## 環境變數

```env
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/vue_bookstore
JWT_SECRET=your_jwt_secret
PORT=8000
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 功能範圍

### 前台（一般用戶）
- 書籍列表（分類篩選、關鍵字搜尋、分頁）
- 書籍詳情頁
- 購物車（Pinia 管理）
- 結帳 / 建立訂單
- 我的訂單列表

### 後台（管理員）
- 登入（JWT 驗證 + 路由守衛）
- 書籍 CRUD（新增 / 編輯 / 刪除）
- 訂單列表 + 狀態更新

## 注意事項

- 前後台共用同一套後端 API，透過角色（role）區分權限
- 管理員帳號不開放前台註冊，由後端直接建立
- 購物車資料存於 Pinia（重新整理後從後端同步）
