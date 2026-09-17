// utils/validators.ts — 前端共用的驗證函式
// 把規則集中在這裡，所有表單都 import 同一份，改一處全部生效

// 是否有填寫（去掉空白後不為空）
export const isNotEmpty = (val: string): boolean =>
  val.trim().length > 0

// Email 格式：有 @ 和 .，且三段都不含空白
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// 台灣手機號碼：09 開頭，共 10 碼（09xxxxxxxx）
export const isValidPhone = (phone: string): boolean =>
  /^09\d{8}$/.test(phone)

// 最小長度（不自動 trim，讓呼叫端決定是否先 trim）
// 密碼不應 trim（空格算字元），地址呼叫前先 trim 再傳入
export const isMinLength = (val: string, min: number): boolean =>
  val.length >= min
