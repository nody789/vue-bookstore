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

## React 備註規範（學習模式）

程式碼請加入中文備註，幫助理解 React 的概念：

* **每個 Component 檔案頂部**：說明這個元件的職責是什麼
* **`useState`**：說明這個 state 存什麼資料、為什麼需要它
* **`useEffect`**：說明副作用的觸發時機與目的
* **`useCallback` / `useMemo`**：說明為什麼需要快取，避免什麼問題
* **Props**：複雜的 props 說明從哪裡傳入、代表什麼意思
* **條件渲染**：說明判斷條件背後的商業邏輯

請額外提供：

【為什麼用這個 Hook / 這樣設計】

【資料流（資料從哪來、怎麼傳遞）】

【常見錯誤或注意事項】

---

## Next.js (TypeScript)

規則：

* 優先使用 App Router（非 Pages Router）
* 預設為 Server Component，需要互動才加 `'use client'`
* 資料獲取優先在 Server Component 完成，不要在 Client Component 直接打後端 API
* 路由使用 `app/` 目錄結構，共用 Layout 邏輯放 `layout.tsx`
* 環境變數：前端可用的加 `NEXT_PUBLIC_` 前綴，其餘只保留在 Server 端
* API Route 放在 `app/api/` 下，一律使用 Route Handler（`route.ts`）

備註：

使用 Next.js 時請明確區分 Server / Client Component，
若發現不必要的 `'use client'` 或效能問題，請主動提示。

---

## Next.js 備註規範（學習模式）

Next.js 和傳統 React 有重要差異，程式碼請加入中文備註說明：

* **每個 Component 頂部**：標明 Server Component 或 Client Component，說明為什麼
* **`'use client'`**：說明為什麼這個元件需要在 client 端執行
* **Server Component 的 `async/await`**：說明在 server 端直接取得資料的好處（SEO、效能、不用 loading 狀態）
* **Next.js `<Image>`**：說明和原生 `<img>` 的差異（自動最佳化、WebP 轉換、lazy loading）
* **Next.js `<Link>`**：說明和原生 `<a>` 的差異（SPA 導頁不刷新、自動 prefetch）
* **動態路由 `[id]`**：說明參數從哪裡來、如何在元件取得
* **`layout.tsx`**：說明共用 Layout 的概念與用途
* **`loading.tsx` / `error.tsx`**：說明 Next.js 的自動 Streaming UI

請額外提供：

【Next.js 和傳統 React 的差異】（每次遇到時說明）

【為什麼這裡用 Server Component / Client Component】

【常見錯誤：誤加 `'use client'`、在 Server Component 用 hooks 等】

---

## React 核心概念說明（學習重點）

遇到以下概念時，請加入說明讓開發者理解原理：

### Re-render 觸發時機

React 元件在以下情況重新渲染：
1. **自己的 state 改變**
2. **父元件重新渲染**（即使 props 沒變，子元件也跟著渲染）
3. **傳入的 props 改變**

注意：Next.js **Server Component 不會 re-render**，只有 Client Component 才有 re-render 概念。

遇到效能問題時，說明是哪種 re-render 觸發，以及如何用 `useMemo` / `useCallback` / `React.memo` 解決。

### useEffect dependency array（最常見 bug 來源）

```js
useEffect(() => { ... })          // 每次渲染都跑 ← 通常是 bug
useEffect(() => { ... }, [])      // 只在第一次掛載跑
useEffect(() => { ... }, [value]) // value 改變時才跑
```

遇到 `useEffect` 時，請說明觸發時機與目的。
**不要用 useEffect 抓資料：React 專案用 `useQuery`，Next.js 用 Server Component `async/await`。**

### Key prop（list 渲染必知）

```jsx
// 錯誤：用 index 當 key，增刪時 React 無法正確追蹤，會有奇怪 bug
{items.map((item, index) => <Card key={index} />)}

// 正確：用資料的唯一 id
{items.map((item) => <Card key={item.id} />)}
```

每次產生 list 渲染時，說明為什麼 key 要用 id 而不是 index。

---

## 表單處理

### React 專案（無 Next.js）— Controlled Component

```jsx
const [email, setEmail] = useState('')

<input
  value={email}                               // state 控制顯示的值
  onChange={(e) => setEmail(e.target.value)}  // 輸入時更新 state
/>
```

若表單較複雜，建議使用 `react-hook-form`（效能更好、驗證更方便）。

### Next.js 專案 — 優先考慮 Server Actions

```tsx
async function handleSubmit(formData: FormData) {
  'use server'
  // 在 server 直接處理，不需要額外 API 路由
  const email = formData.get('email')
}
```

遇到表單時，請說明使用 Controlled Component 還是 Server Actions，以及原因。

---

## 全域狀態管理

### useState / useEffect / useQuery / Zustand 的關聯與選擇

這四個工具各管不同類型的狀態，不是競爭關係：

| 工具 | 管什麼 | 使用時機 |
|------|--------|----------|
| `useState` | 元件內部的本地狀態 | 只有這個元件自己需要的資料（輸入框值、toggle 開關） |
| `useEffect` | 元件掛載/更新後的副作用 | 監聽事件、計時器、DOM 操作（**不要用來抓 API**） |
| `useQuery` | 來自伺服器的資料 | 所有 API 請求，自動處理 loading / error / cache |
| `Zustand` | 多元件共享的全域狀態 | 登入使用者、跨頁需要保留的資料 |

**判斷流程：**
```
這個資料從 API 來的？
  → YES → useQuery
  → NO  → 只有這個元件需要？
             → YES → useState
             → NO（多個元件/頁面都要用）→ Zustand

useEffect 什麼時候還會用？
  → 監聽事件（resize、scroll）
  → 計時器（setTimeout / setInterval）
  → DOM 操作（手動 focus）
  → 不是抓資料的副作用
```

### Zustand 備註規範

Zustand store 程式碼請加入中文備註：

* **store 頂部**：說明這個 store 負責管理哪些全域狀態
* **每個 state 欄位**：說明存什麼資料、初始值為何
* **每個 action（函式）**：說明觸發時機、做什麼事、會影響哪些 state
* **從元件使用 store 時**：說明「為什麼這個資料要放全域而不是 useState」

### React 專案（無 Next.js）

使用 **Zustand**，語法簡潔，適合小到中型專案。

### Next.js 專案

優先靠 Server Component 直接取得資料，**減少對全域 state 的依賴**。
需要 client 端全域狀態（登入資訊、UI 狀態）時，再使用 **Zustand**。

### Zustand vs Redux

| | Zustand | Redux |
|---|---|---|
| 程式碼量 | 少，直接定義 state + action | 多，需要 action / reducer / store |
| 學習曲線 | 低 | 高 |
| 適合規模 | 小～中型 | 大型、多人團隊 |
| 樣板程式碼 | 幾乎沒有 | 很多（boilerplate） |

### 何時考慮 Redux？

* 超大型應用，多個團隊同時開發
* 公司已有 Redux 技術棧
* 需要 time-travel debugging 嚴格追蹤狀態變化

### 學習建議

先學 Zustand → 再改寫成 Redux 對比，理解兩者差異效果最好。

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

成功 + 分頁：

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

失敗格式：

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

備註：

* `code` 為機器可讀的錯誤代碼（英文大寫），前端用來判斷邏輯
* `errors` 僅在表單驗證失敗時提供
* 如果專案已有既有格式，請優先沿用

---

# 安全性規則

開發時必須遵守，不需等到 Code Review 才檢查。

* 密碼、API Key、Secret 一律寫在環境變數，禁止寫在程式碼裡
* 所有使用者輸入必須驗證，使用 Zod 處理（驗證 + 型別推導）
* 資料庫操作禁止字串拼接 SQL，一律使用 ORM 或參數化查詢
* API 端點必須驗證身份（JWT），公開端點需明確標註 `// public`
* 回應資料禁止包含密碼、token 等敏感欄位
* 前端禁止儲存敏感資料於 localStorage，改用 httpOnly Cookie
* Express 專案必須加 `helmet`（設定安全 HTTP header）
* Express 專案必須加 `cors`，明確設定允許的 origin，禁止 `*`
* API 需加 Rate Limiting（`express-rate-limit`），防止暴力破解
* JWT 必須設定過期時間（`expiresIn`），不可使用永不過期的 token

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
| 全域狀態 | Zustand（小～中型）/ Redux Toolkit（大型多團隊） |
| 伺服器狀態快取 | @tanstack/react-query（React）/ SWR（Next.js 可選） |
| 測試 | Vitest |
| Express 安全 Header | helmet |
| CORS 設定 | cors |
| Rate Limiting | express-rate-limit |

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

commit message 只寫功能說明，不加 `Co-Authored-By` 或任何 Claude 相關資訊。

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
