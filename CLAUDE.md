# CLAUDE.md

# 專案 AI 助理設定檔

## 開發者背景

目前為中階前端工程師。

主要技術：

* React
* Vue
* Tailwind CSS
* TypeScript

正在持續學習：

* Node.js
* Express
* RESTful API 設計
* 系統架構設計
* CI/CD

請在協助開發時：

* 提供可維護的程式碼
* 提供實務建議
* 必要時解釋原因
* 避免過度複雜的架構

---

# 程式碼規範

## TypeScript

規則：

* 避免使用 any
* 優先使用 interface
* 型別需明確定義

備註：

如果有更好的型別設計方式，
請說明原因並提供範例。

---

## React

規則：

* 使用 Functional Component
* 使用 Hooks
* Component 需可重用
* 避免過度拆分元件

備註：

若有更好的結構，
請說明為什麼要這樣調整。

---

## Vue

規則：

* 使用 Composition API
* 使用 script setup

備註：

如果有 Vue 最佳實務，
請一併說明。

---

## Tailwind CSS

規則：

* 優先使用 Tailwind
* 避免大量 inline style
* 優先考慮 RWD

備註：

若有更好的排版方式，
請提供建議。

---

# Node.js

目前為學習階段。

請在產生 Node.js 程式碼時：

* 加入適當註解
* 說明目錄結構
* 說明每個檔案用途
* 說明 API 流程

備註：

不要只給程式碼。

請額外說明：

1. 為什麼這樣寫
2. 流程如何運作
3. 未來如何擴充

---

# API 規範

成功格式：

```json
{
  "success": true,
  "data": {}
}
```

失敗格式：

```json
{
  "success": false,
  "message": ""
}
```

備註：

如果專案已有既有格式，
請優先沿用。

---

# 安全性規則

開發時必須遵守，不需等到 Code Review 才檢查。

* 密碼、API Key、Secret 一律寫在環境變數，禁止寫在程式碼裡
* 所有使用者輸入必須驗證，使用 Zod 處理
* 資料庫操作禁止字串拼接 SQL，一律使用 ORM 或參數化查詢
* API 端點必須驗證身份（JWT），公開端點需明確標註
* 回應資料禁止包含密碼、token 等敏感欄位
* 前端禁止儲存敏感資料於 localStorage，改用 httpOnly Cookie

---

# 慣用套件

每個專案優先使用以下套件，保持一致性。
若專案已使用其他套件，請優先沿用既有選擇。

| 用途 | 套件 |
|------|------|
| 資料庫 ORM | Prisma |
| 資料驗證 | Zod |
| JWT 處理 | jose |
| 密碼雜湊 | bcrypt |
| 日期處理 | day.js |
| 前端 HTTP 請求 | axios |
| 測試 | Vitest |

---

# Git 規則

## Branch 命名

```
feat/功能名稱       新功能
fix/問題名稱        Bug 修復
chore/雜項名稱      套件更新、設定調整
refactor/名稱       重構，不影響功能
```

## Commit 格式

```
feat: 新增使用者登入功能
fix: 修復購物車數量計算錯誤
chore: 更新 Prisma 至 5.x
refactor: 拆分 AuthService 邏輯
```

---

# Code Review

每次 Review 時請檢查：

* Bug
* TypeScript
* React/Vue Best Practice
* 效能
* 安全性
* 可維護性

輸出格式：

1. 問題
2. 原因
3. 建議修正方式

---

# 新功能開發流程

請遵守以下順序：

1. 分析需求
2. 設計資料結構
3. 設計 API
4. 設計 UI
5. 實作功能
6. 撰寫測試

不要直接開始寫程式。

---

# 教學模式

當需求涉及以下技術時：

* Node.js
* Express
* 系統架構
* Docker
* CI/CD

請額外提供：

【學習重點】

【實務做法】

【常見錯誤】

【未來進階方向】

協助開發者持續成長。

---

# 開始開發前

**每次開新專案，請先執行以下步驟：**

1. 閱讀 `docs/PROJECT.md` — 了解專案目標與技術棧
2. 閱讀 `docs/API.md` — 了解 API 規格與端點
3. 閱讀 `docs/DATABASE.md` — 了解資料結構與關聯
4. 閱讀 `docs/UI_RULES.md` — 了解 UI 設計規範
5. 摘要你理解的內容，確認後再開始開發

---

# 備註

專案特殊規則請寫於：

* `docs/PROJECT.md`
* `docs/API.md`
* `docs/DATABASE.md`
* `docs/UI_RULES.md`
* `docs/CHANGELOG.md`
