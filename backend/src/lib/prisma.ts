/**
 * 【檔案說明】
 * 建立並匯出全域共用的 Prisma Client 實例。
 *
 * 【架構角色】
 * 所有 service 都透過這個 prisma 物件來操作資料庫，
 * 不直接撰寫 SQL，改由 Prisma ORM 負責生成安全的參數化查詢，
 * 天然防止 SQL Injection 攻擊。
 *
 * 【為什麼用 pg.Pool + PrismaPg adapter？】
 * 預設的 Prisma Client 使用內建的 query engine（一個 Rust binary）。
 * 改用 pg.Pool + PrismaPg driver adapter 可以：
 * 1. 使用 Node.js 原生的 pg 連線池，效能更可控
 * 2. 支援部分不支援 Rust binary 的部署環境（例如 Cloudflare Workers、edge runtime）
 * 3. ssl: { rejectUnauthorized: false } 讓開發環境在 SSL 憑證不完整時仍可連線（正式環境應設為 true）
 */
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// 建立 PostgreSQL 連線池，連線字串從環境變數讀取（不能寫在程式碼裡）
const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL'],
  ssl: { rejectUnauthorized: false },
})

// 將 pg 連線池包裝成 Prisma 可用的 adapter 格式
const adapter = new PrismaPg(pool)

// 建立 Prisma Client，注入 adapter 讓它透過 pg.Pool 連資料庫
// 整個應用程式共用這一個 prisma 實例（singleton 模式），避免開太多不必要的連線
export const prisma = new PrismaClient({ adapter })
