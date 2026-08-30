import { hmacSha256Hex, randomToken } from './crypto.js'

// Solapi 단문 발송 (https://developers.solapi.com)
// env.SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER_NUMBER 가 설정돼야 실제 발송됨.
// 아직 계정/키가 없는 개발 단계에서는 콘솔 로그로만 남기고 성공 처리한다 (버튼 활성화 등 전체 흐름 테스트 가능).
export async function sendSms(env, to, text) {
  const { SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER } = env

  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET || !SOLAPI_SENDER_NUMBER) {
    console.log(`[SMS:dev-mode] to=${to} text=${text}`)
    return { ok: true, dev: true }
  }

  const date = new Date().toISOString()
  const salt = randomToken()
  const signature = await hmacSha256Hex(SOLAPI_API_SECRET, date + salt)

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: {
        to: to.replace(/\D/g, ''),
        from: SOLAPI_SENDER_NUMBER.replace(/\D/g, ''),
        text,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[SMS:error] status=${res.status} body=${body}`)
    throw new Error('SMS 발송에 실패했습니다')
  }

  return { ok: true }
}

export function otpMessage(code) {
  return `[운암상회] 인증번호는 ${code}입니다. 5분 이내에 입력해주세요.`
}

export function bookingConfirmedMessage({ date, time, partySize, menu }) {
  return `[운암상회] 예약이 확정되었습니다.\n${date} ${time} / ${partySize}명 / ${menu}\n문의: 매장 전화`
}

export function bookingOwnerMessage({ date, time, partySize, menu, name, phone }) {
  return `[운암상회 예약알림] ${date} ${time} / ${partySize}명 / ${menu}\n예약자: ${name} (${phone})`
}

export function bookingUpdatedMessage({ date, time, partySize, menu }) {
  return `[운암상회] 예약이 변경되었습니다.\n${date} ${time} / ${partySize}명 / ${menu}`
}

export function bookingCancelledMessage({ date, time }) {
  return `[운암상회] 예약이 취소되었습니다. (${date} ${time})`
}
