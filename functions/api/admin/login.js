import { getAdminConfig, setAdminConfig } from '../../_shared/db.js'
import { hashSecret } from '../../_shared/crypto.js'
import { issueAdminToken } from '../../_shared/admin.js'
import { errorResponse, jsonResponse } from '../../_shared/validate.js'

const DEFAULT_ADMIN_PASSWORD = '2085'
const MAX_ATTEMPTS = 5
const LOCK_MS = 5 * 60 * 1000

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const password = String(body.password || '')
  if (!password) return errorResponse('비밀번호를 입력해주세요')

  const lockedUntil = await getAdminConfig(env, 'admin_login_locked_until')
  if (lockedUntil && new Date(lockedUntil).getTime() > Date.now()) {
    return errorResponse('비밀번호를 여러 번 틀려 잠시 잠겼습니다. 5분 후 다시 시도해주세요', 429)
  }

  const storedHash = await getAdminConfig(env, 'admin_password_hash')
  const submittedHash = await hashSecret(password, env.TOKEN_SECRET)
  const ok = storedHash ? submittedHash === storedHash : password === DEFAULT_ADMIN_PASSWORD

  if (!ok) {
    const failCount = Number(await getAdminConfig(env, 'admin_login_fail_count')) || 0
    const nextCount = failCount + 1
    if (nextCount >= MAX_ATTEMPTS) {
      await setAdminConfig(env, 'admin_login_locked_until', new Date(Date.now() + LOCK_MS).toISOString())
      await setAdminConfig(env, 'admin_login_fail_count', '0')
      return errorResponse('비밀번호를 5회 이상 틀려 5분간 잠깁니다', 429)
    }
    await setAdminConfig(env, 'admin_login_fail_count', String(nextCount))
    return errorResponse('비밀번호가 일치하지 않습니다', 401)
  }

  await setAdminConfig(env, 'admin_login_fail_count', '0')
  if (!storedHash) {
    await setAdminConfig(env, 'admin_password_hash', submittedHash)
  }

  const adminToken = await issueAdminToken(env)
  return jsonResponse({ ok: true, adminToken })
}
