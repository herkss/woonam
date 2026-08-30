import { getLatestOtp, incrementOtpAttempts, markOtpVerified } from '../../_shared/db.js'
import { hashSecret, randomToken } from '../../_shared/crypto.js'
import { normalizePhone, isValidKrMobile, isValidOtpCode, errorResponse, jsonResponse } from '../../_shared/validate.js'

const PURPOSES = new Set(['booking', 'manage'])

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const phone = normalizePhone(body.phone)
  const purpose = body.purpose
  const code = String(body.code || '')

  if (!isValidKrMobile(phone)) return errorResponse('휴대폰 번호 형식이 올바르지 않습니다')
  if (!PURPOSES.has(purpose)) return errorResponse('잘못된 요청입니다')
  if (!isValidOtpCode(code)) return errorResponse('인증번호는 6자리 숫자입니다')

  const row = await getLatestOtp(env, phone, purpose)
  if (!row) return errorResponse('인증번호를 먼저 요청해주세요')
  if (row.verified_at) return errorResponse('이미 인증이 완료되었습니다. 다시 요청해주세요')
  if (row.attempts >= 5) return errorResponse('시도 횟수를 초과했습니다. 인증번호를 다시 요청해주세요', 429)

  const expiresAt = new Date(row.expires_at).getTime()
  if (Date.now() > expiresAt) return errorResponse('인증번호가 만료되었습니다. 다시 요청해주세요')

  const codeHash = await hashSecret(code, env.TOKEN_SECRET)
  if (codeHash !== row.code_hash) {
    await incrementOtpAttempts(env, row.id)
    return errorResponse('인증번호가 일치하지 않습니다')
  }

  const verifyToken = randomToken()
  await markOtpVerified(env, row.id, verifyToken)

  return jsonResponse({ ok: true, verifyToken })
}
