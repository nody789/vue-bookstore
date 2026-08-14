# UI_RULES.md

## 設計系統

純 Tailwind CSS（不使用額外 Vue UI Library）

> 選擇原因：完全掌控樣式、展示 Tailwind 切版能力、不被 UI Library 版本綁定

## 色彩規範

```
主色（書店暖棕）：amber-700   #b45309
主色深：amber-800             #92400e
主色淺（背景）：amber-50      #fffbeb

輔色（文字強調）：stone-800   #292524
輔色淺（輔助文字）：stone-500 #78716c

狀態色：
  success：green-600
  warning：yellow-500
  error：red-600
  info：blue-600

背景色：gray-50
邊框色：gray-200
```

## 字體規範

```
標題 H1：font-bold text-3xl text-stone-800
標題 H2：font-bold text-2xl text-stone-800
副標題：font-semibold text-xl text-stone-700
內文：text-base text-stone-600
輔助文字：text-sm text-stone-400
價格：font-bold text-xl text-amber-700
```

## RWD 斷點

| 名稱 | 寬度 | 說明 |
|------|------|------|
| sm | 640px | 手機橫向 |
| md | 768px | 平板 |
| lg | 1024px | 筆電 |
| xl | 1280px | 桌機 |

書籍列表格線：
- 手機：1 欄
- 平板（md）：2 欄
- 筆電（lg）：3 欄
- 桌機（xl）：4 欄

## 元件規範

### 按鈕

```html
<!-- 主要按鈕（加入購物車、結帳） -->
<button class="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded transition">

<!-- 次要按鈕（取消、返回） -->
<button class="border border-amber-700 text-amber-700 hover:bg-amber-50 px-4 py-2 rounded transition">

<!-- 危險按鈕（刪除） -->
<button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">
```

### 書籍卡片

```html
<!-- 前台書籍卡片 -->
<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
  <!-- 封面圖（4:3 比例）、書名、作者、價格 -->
</div>
```

### 表單

```html
<!-- 輸入框 -->
<input class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">

<!-- 錯誤提示 -->
<p class="text-red-600 text-sm mt-1">錯誤訊息</p>
```

### 後台 Table

```html
<table class="w-full text-sm border-collapse">
  <thead class="bg-gray-100 text-stone-600">
  <tbody class="divide-y divide-gray-200">
```

### 訂單狀態 Badge

```
PENDING：bg-yellow-100 text-yellow-700
PAID：bg-blue-100 text-blue-700
SHIPPED：bg-purple-100 text-purple-700
COMPLETED：bg-green-100 text-green-700
CANCELLED：bg-gray-100 text-gray-500
```

## Layout

### 前台
- 頂部 Navbar：Logo + 搜尋列 + 購物車 icon（顯示數量）+ 登入/用戶選單
- 最大寬度：`max-w-7xl mx-auto px-4`

### 後台
- 左側 Sidebar（固定）：導覽連結（書籍管理、訂單管理）
- 右側內容區域

## 動畫與過渡

- 按鈕 hover：`transition duration-150`
- 卡片 hover shadow：`transition duration-150`
- Modal：使用 Vue `<Transition>` 搭配 fade 效果

## 備註

- 圖片統一使用 `<img>` 搭配 `object-cover`，書封比例固定為 3:4
- 無書封時顯示預設佔位圖（灰色背景 + 書名文字）
- 後台頁面不需要響應式，最小寬度 1024px
