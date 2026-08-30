import { hmacSha256Hex } from './crypto.js'

const SESSION_MS = 12 * 60 * 60 * 1000 // 12시간

export async function issueAdminToken(env) {
  const expiresAt = Date.now() + SESSION_MS
  const signature = await hmacSha256Hex(env.TOKEN_SECRET, `admin:${expiresAt}`)
  return `${expiresAt}.${signature}`
}

export async function verifyAdminToken(env, token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false
  const [expiresAtStr, signature] = token.split('.')
  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false

  const expected = await hmacSha256Hex(env.TOKEN_SECRET, `admin:${expiresAt}`)
  return expected === signature
}
