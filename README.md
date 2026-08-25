# Vue Bookstore — 線上書店

前後台分離的線上書店作品集專案。

前台：書籍瀏覽、購物車、結帳
後台：書籍管理、訂單管理（管理員）

---

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Vue3 + TypeScript + Tailwind CSS + Pinia + Vue Router |
| 後端 | Node.js + Express + TypeScript + Prisma |
| 資料庫 | PostgreSQL |

---

## 測試帳號

| 身份 | Email | 密碼 | 權限 |
|------|-------|------|------|
| 管理員 | admin@bookstore.com | admin1234 | 前台 + 後台管理 |
| 一般會員 | user@bookstore.com | user1234 | 前台購物 |

---

## 啟動方式

```bash
# 後端
cd backend
cp .env.example .env    # 填入環境變數
npm install
npx prisma migrate dev  # 建立資料表
npm run dev             # 啟動於 http://localhost:8000

# 前端
cd frontend
npm install
npm run dev             # 啟動於 http://localhost:5173
```

---

## 文件說明

```
docs/
├── PROJECT.md    ← 專案目標、技術棧、目錄結構
├── API.md        ← API 端點列表與格式說明
├── DATABASE.md   ← 資料表結構與關聯
├── UI_RULES.md   ← UI 規則、色彩、元件規範
└── CHANGELOG.md  ← 版本異動紀錄
```
