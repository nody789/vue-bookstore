# API.md

## Base URL

```
開發環境：http://localhost:3000/api
正式環境：https://（填入）/api
```

## 認證方式

> 例如：Bearer Token、Cookie Session 等

```
Authorization: Bearer <token>
```

## 統一回應格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

失敗：

```json
{
  "success": false,
  "message": "錯誤描述"
}
```

## API 端點列表

### 使用者

| Method | 路徑 | 說明 |
|--------|------|------|
| POST | /auth/login | 登入 |
| POST | /auth/logout | 登出 |
| GET | /users/me | 取得當前使用者資訊 |

### （其他模組）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /（填入） | （填入） |
| POST | /（填入） | （填入） |

## 錯誤代碼

| Code | 說明 |
|------|------|
| 400 | 請求參數錯誤 |
| 401 | 未認證 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 500 | 伺服器錯誤 |

## 備註

> 其他需要說明的 API 規則或慣例
