/**
 * 【檔案說明】
 * 這是整個後端應用程式的入口點（Entry Point）。
 * 負責建立 Express 應用、掛載所有 middleware、連接路由，並啟動 HTTP Server。
 *
 * 【架構角色】
 * 這裡是「組裝中心」，把所有零件（middleware、路由）拼在一起，
 * 但本身不包含任何商業邏輯，商業邏輯都在 services/ 裡。
 *
 * 【請求流程】
 * 請求進來 → helmet → cors → rate limit → 路由 → controller → service → 回傳
 * 發生錯誤 → errorHandler 統一捕捉 → 回傳標準錯誤格式
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import router from './routes/index'
import { errorHandler } from './middlewares/errorHandler'

const app = express()
const PORT = process.env['PORT'] || 8000

// helmet 自動設定安全用的 HTTP Response Header（防 XSS、clickjacking 等攻擊）
app.use(helmet())

// cors 設定允許哪些前端來源可以存取此 API
// credentials: true 讓前端可以帶 Cookie（若有需要）
// 注意：不能用 origin: '*'，因為搭配 credentials 必須明確指定來源
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// 讓 Express 能讀取 JSON 格式的 request body（例如 POST 傳來的 { email, password }）
app.use(express.json())
// 讓 Express 能讀取 HTML form 格式的 request body（application/x-www-form-urlencoded）
app.use(express.urlencoded({ extended: true }))

// 全域 rate limit（每分鐘 100 次）
// 防止惡意使用者在短時間內大量請求，耗盡伺服器資源
// 更嚴格的限制（例如登入端點）會在各路由檔案裡個別設定
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,  // 在 Response Header 回傳剩餘次數等資訊（RateLimit-* 格式）
  legacyHeaders: false,   // 關閉舊版 X-RateLimit-* header
}))

// 所有 API 都掛在 /api/v1 前綴下，方便未來推出 v2 時不影響現有客戶端
app.use('/api/v1', router)

// 統一錯誤處理，必須放在所有路由的最後面
// Express 透過「四個參數」辨認這是 error handler middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
