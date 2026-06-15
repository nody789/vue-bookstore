# DATABASE.md

## 資料庫類型

> 例如：MySQL、PostgreSQL、MongoDB、SQLite

## 連線設定

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=（填入）
DB_USER=（填入）
```

## 資料表說明

### users（使用者）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT PK | 主鍵 |
| email | VARCHAR | 電子信箱（唯一） |
| name | VARCHAR | 使用者名稱 |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

### （其他資料表）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | INT PK | 主鍵 |
| （填入） | （填入） | （填入） |

## 資料表關聯

```
users 1──N （填入）
（填入） N──N （填入）
```

## 索引說明

> 有哪些欄位有建立索引，原因是什麼

## 備註

> 其他資料庫相關說明，例如：軟刪除策略、分頁規則等
