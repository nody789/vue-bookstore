/**
 * 【檔案說明】
 * 身份驗證相關的 Service（服務層）。
 *
 * 【架構角色】
 * Service 是「商業邏輯的核心」，負責：
 * 1. 跟資料庫溝通（透過 prisma）
 * 2. 執行商業規則（例如：Email 不能重複、密碼需要雜湊）
 * 3. 回傳處理結果給 controller
 *
 * Service 不處理 HTTP 相關的東西（req、res），保持純粹的商業邏輯。
 */
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../types/index.js'
import type { RegisterInput, LoginInput } from '../validators/auth.js'

// 每次呼叫時動態取得 secret，確保讀取到最新的環境變數值
const getSecret = () => new TextEncoder().encode(process.env['JWT_SECRET'] || 'fallback_secret')

/**
 * 產生 JWT Token。
 *
 * 【為什麼設定 7 天過期？】
 * 過短（例如 15 分鐘）需要頻繁重新登入，使用者體驗差。
 * 過長（例如永不過期）一旦 token 被盜，攻擊者可以無限期使用。
 * 7 天是常見的平衡點；若需要更高安全性，可搭配 refresh token 機制。
 *
 * 【為什麼用 jose 的 dynamic import？】
 * jose 是 ESM-only 套件，在 CommonJS 環境（Node.js 預設）需要用 dynamic import 載入。
 */
const signToken = async (payload: { userId: string; email: string; role: string }) => {
  // jose 是 ESM-only 套件，在 CJS 環境需使用 dynamic import
  const { SignJWT } = await import('jose')
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // 使用 HMAC-SHA256 簽章演算法
    .setIssuedAt()                         // 記錄 token 簽發時間（iat）
    .setExpirationTime('7d')               // 設定 7 天後過期（exp）
    .sign(getSecret())
}

/**
 * 使用者註冊。
 *
 * 【商業邏輯說明】
 * 1. 先查 Email 是否已被使用（確保唯一性）
 * 2. 用 bcrypt hash 密碼（cost factor 12，雜湊次數 2^12）
 *    cost factor 越高越安全但越慢，12 是目前業界常見值
 * 3. 儲存使用者資料，select 明確排除 passwordHash（敏感欄位不回傳）
 * 4. 立即簽發 JWT，讓使用者註冊後不需要再次登入
 *
 * 【為什麼不直接儲存明文密碼？】
 * 若資料庫被攻擊者取得，明文密碼會直接洩漏。
 * bcrypt 產生的雜湊值即使被取得，也無法反推出原始密碼（單向雜湊）。
 */
export const register = async (input: RegisterInput) => {
  const exists = await prisma.user.findUnique({ where: { email: input.email } })
  if (exists) throw new AppError(409, 'CONFLICT', 'Email 已被使用')

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash },
    // 明確只選取要回傳的欄位，避免 passwordHash 被包含在回應中
    select: { id: true, email: true, name: true, role: true },
  })

  const token = await signToken({ userId: user.id, email: user.email, role: user.role })
  return { user, token }
}

/**
 * 使用者登入。
 *
 * 【商業邏輯說明】
 * 1. 查詢使用者（同時過濾 deletedAt: null，排除已被軟刪除的帳號）
 * 2. 用 bcrypt.compare 比對輸入的密碼和資料庫中的雜湊值
 * 3. 簽發 JWT Token 回傳給前端
 *
 * 【為什麼帳號不存在和密碼錯誤都回傳同樣的錯誤訊息？】
 * 如果分開回傳「帳號不存在」和「密碼錯誤」，攻擊者可以用此來探測哪些 Email 已被註冊，
 * 統一回傳「帳號或密碼錯誤」可以防止這種帳號枚舉攻擊（account enumeration attack）。
 */
export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email, deletedAt: null },
  })
  // 故意不說是帳號不存在還是密碼錯誤，防止帳號枚舉攻擊
  if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', '帳號或密碼錯誤')

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', '帳號或密碼錯誤')

  const token = await signToken({ userId: user.id, email: user.email, role: user.role })
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  }
}
