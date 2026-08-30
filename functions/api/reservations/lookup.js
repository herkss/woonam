import { consumeVerifyToken, getReservationsByPhone } from '../../_shared/db.js'
import { hashSecret } from '../../_shared/crypto.js'
import { normalizePhone, isValidKrMobile, errorResponse, jsonResponse } from '../../_shared/validate.js'

function toPublicReservation(r) {
  return {
    id: r.id,
    date: r.date,
    time: r.time,
    partySize: r.party_size,
    menu: r.menu,
    name: r.name,
    phone: r.phone,
  }
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const phone = normalizePhone(body.phone)
  const pin = body.pin ? String(body.pin) : null
  const verifyToken = body.verifyToken || null

  if (!isValidKrMobile(phone)) return errorResponse('휴대폰 번호 형식이 올바르지 않습니다')
  if (!pin && !verifyToken) return errorResponse('비밀번호 또는 문자 인증이 필요합니다')

  const all = await getReservationsByPhone(env, phone)

  if (verifyToken) {
    const otpRow = await consumeVerifyToken(env, { token: verifyToken, purpose: 'manage', phone })
    if (!otpRow) return errorResponse('문자 인증이 만료되었거나 유효하지 않습니다', 401)
    return jsonResponse({ ok: true, reservations: all.map(toPublicReservation) })
  }

  const pinHash = await hashSecret(pin, env.TOKEN_SECRET)
  const matched = all.filter((r) => r.pin_hash === pinHash)
  if (matched.length === 0) return errorResponse('일치하는 예약을 찾을 수 없습니다. 비밀번호를 확인해주세요', 401)

  return jsonResponse({ ok: true, reservations: matched.map(toPublicReservation) })
}
