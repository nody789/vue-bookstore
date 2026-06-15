# UI_RULES.md

## 設計系統

> 使用哪套 UI Library？例如：shadcn/ui、Ant Design、純 Tailwind

## 色彩規範

```css
/* 主色 */
primary: （填入）

/* 輔色 */
secondary: （填入）

/* 狀態色 */
success: green-500
warning: yellow-500
error: red-500
info: blue-500
```

## 字體規範

```
標題：font-bold text-2xl
副標題：font-semibold text-xl
內文：text-base
輔助文字：text-sm text-gray-500
```

## RWD 斷點

| 名稱 | 寬度 | 說明 |
|------|------|------|
| sm | 640px | 手機橫向 |
| md | 768px | 平板 |
| lg | 1024px | 筆電 |
| xl | 1280px | 桌機 |

## 元件規範

### 按鈕

```html
<!-- 主要按鈕 -->
<button class="bg-primary text-white px-4 py-2 rounded">

<!-- 次要按鈕 -->
<button class="border border-primary text-primary px-4 py-2 rounded">
```

### 表單

> 表單欄位、錯誤提示的統一樣式規則

### 卡片

> 卡片元件的統一樣式規則

## 動畫與過渡

> 是否使用動畫？統一的 transition duration 是多少？

## 備註

> 其他 UI 相關規則或慣例
