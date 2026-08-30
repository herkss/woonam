import { getAdminConfig, setAdminConfig } from '../../_shared/db.js'
import { hashSecret } from '../../_shared/crypto.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, jsonResponse } from '../../_shared/validate.js'

const DEFAULT_ADMIN_PASSWORD = '2085'

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const adminToken = String(body.adminToken || '')
  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')

  if (!(await verifyAdminToken(env, adminToken))) return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  if (newPassword.length < 4 || newPassword.length > 40) {
    return errorResponse('새 비밀번호는 4자 이상 40자 이하로 입력해주세요')
  }

  const storedHash = await getAdminConfig(env, 'admin_password_hash')
  const currentHash = await hashSecret(currentPassword, env.TOKEN_SECRET)
  const currentOk = storedHash ? currentHash === storedHash : currentPassword === DEFAULT_ADMIN_PASSWORD
  if (!currentOk) return errorResponse('현재 비밀번호가 일치하지 않습니다', 401)

  const newHash = await hashSecret(newPassword, env.TOKEN_SECRET)
  await setAdminConfig(env, 'admin_password_hash', newHash)

  return jsonResponse({ ok: true })
}
