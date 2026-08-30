import { getLatestOtp, insertOtp } from '../../_shared/db.js'
import { hashSecret, randomDigits } from '../../_shared/crypto.js'
import { sendSms, otpMessage } from '../../_shared/sms.js'
import { normalizePhone, isValidKrMobile, errorResponse, jsonResponse } from '../../_shared/validate.js'

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

  if (!isValidKrMobile(phone)) return errorResponse('휴대폰 번호 형식이 올바르지 않습니다')
  if (!PURPOSES.has(purpose)) return errorResponse('잘못된 요청입니다')

  const recent = await getLatestOtp(env, phone, purpose)
  if (recent) {
    const createdAt = new Date(`${recent.created_at.replace(' ', 'T')}Z`).getTime()
    if (Date.now() - createdAt < 60_000) {
      return errorResponse('잠시 후 다시 시도해주세요 (60초)', 429)
    }
  }

  const code = randomDigits(6)
  const codeHash = await hashSecret(code, env.TOKEN_SECRET)
  const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString()

  await insertOtp(env, { phone, purpose, codeHash, expiresAt })
  const result = await sendSms(env, phone, otpMessage(code))

  return jsonResponse({ ok: true, ...(result.dev ? { devCode: code } : {}) })
}
