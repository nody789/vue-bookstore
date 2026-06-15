# 專案模板使用說明

每次開新專案，照以下順序操作。

---

## 操作順序

### Step 1 — 複製這個資料夾

把整個 `project-template` 資料夾複製到你的新專案位置，
並將資料夾名稱改成你的專案名稱。

```
例如：
project-template  →  my-shop
```

---

### Step 2 — 填寫 docs/PROJECT.md

打開 `docs/PROJECT.md`，只需要先填這兩格：

```
專案名稱：（填入）
專案描述：（用 2-3 句話說明這個專案是做什麼的）
```

其他欄位之後再補，不用現在填完。

---

### Step 3 — 請 Claude 幫你設計架構

把專案描述貼給 Claude，然後說：

```
請根據以上幫我設計：
1. 資料表結構（DATABASE.md 格式）
2. API 端點列表（API.md 格式）

先提案，我確認後再開始
```

等 Claude 提案後，仔細看一遍，
有不需要的功能就說「把 XXX 拿掉」，
有遺漏的就說「還需要 XXX」。

---

### Step 4 — 確認並填入文件

確認好之後，把 Claude 設計的內容填入：

- `docs/DATABASE.md` ← 資料表結構
- `docs/API.md`      ← API 端點列表

如果有 UI 規則（用什麼元件庫、色彩規範），
也一起填入 `docs/UI_RULES.md`。

---

### Step 5 — 請 Claude 開始開發

跟 Claude 說：

```
請先閱讀 CLAUDE.md 和 docs/ 底下所有文件，
閱讀完後摘要你理解的內容，確認後再開始開發。
```

Claude 摘要後，你確認內容正確，
回覆「確認，開始開發」即可。

---

## 檔案說明

```
project-template/
├── README.md         ← 你現在看的這份（操作說明）
├── CLAUDE.md         ← Claude 的行為設定，不需要動
└── docs/
    ├── PROJECT.md    ← 專案名稱、描述、技術棧
    ├── API.md        ← API 端點列表
    ├── DATABASE.md   ← 資料表結構
    ├── UI_RULES.md   ← UI 規則、元件、色彩
    └── CHANGELOG.md  ← 版本異動紀錄
```

---

## 快速提示

- `CLAUDE.md` 不需要每次修改，它是通用設定
- 文件填得越詳細，Claude 產出的程式碼越準確
- 不確定怎麼填，就讓 Claude 先提案，你再調整

---

## 進階功能（之後再學）

Claude Code 有以下進階功能，**先做完 1-2 個專案再來看**。
沒有遇到對應的痛點，學了也不知道怎麼用。

| 功能 | 什麼時候需要 | 說明 |
|------|------------|------|
| 多 Agent 協作 | 前後端要同時改很多地方，一個個下指令很慢 | 派多個 Claude 同時做不同任務 |
| MCP 整合 | 每次都要手動從 Notion / GitHub 複製資料給 Claude | 讓 Claude 直接讀取外部工具 |
| 自動排程 | 每次發版都要手動跑測試、寫 CHANGELOG | 定時讓 Claude 自動執行重複任務 |
| 遠端操控 | 想讓 CI/CD 流程自動觸發 Claude | 從外部程式叫 Claude 做事 |

**判斷方式：**
當你發現自己在重複做同樣的事，或手動步驟越來越多，
就是該學對應功能的時機。
