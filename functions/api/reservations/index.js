import { consumeVerifyToken, createReservation, getReservationsByDate, getReservedDatesInMonth } from '../../_shared/db.js'
import { hashSecret } from '../../_shared/crypto.js'
import { sendSms, bookingConfirmedMessage, bookingOwnerMessage } from '../../_shared/sms.js'
import {
  normalizePhone,
  isValidKrMobile,
  isValidDate,
  isValidMonth,
  isValidTime,
  isValidPin,
  errorResponse,
  jsonResponse,
} from '../../_shared/validate.js'
import { maskName, maskPhone, formatTimeLabel, formatPartyLabel } from '../../../src/lib/mask.js'

const MAX_PARTY_SIZE = 20

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const month = url.searchParams.get('month')
  if (month !== null) {
    if (!isValidMonth(month)) return errorResponse('month 파라미터 형식이 올바르지 않습니다 (YYYY-MM)')
    const dates = await getReservedDatesInMonth(env, month)
    return jsonResponse({ ok: true, month, dates })
  }

  const date = url.searchParams.get('date')
  if (!isValidDate(date)) return errorResponse('date 파라미터가 필요합니다 (YYYY-MM-DD)')

  const rows = await getReservationsByDate(env, date)
  const reservations = rows.map((r) => ({
    time: r.time,
    timeLabel: formatTimeLabel(r.time),
    partySize: r.party_size,
    partyLabel: formatPartyLabel(r.party_size),
    maskedName: maskName(r.name),
    maskedPhone: maskPhone(r.phone),
    line: `${maskName(r.name)},${maskPhone(r.phone)},${formatPartyLabel(r.party_size)},${formatTimeLabel(r.time)}`,
  }))

  return jsonResponse({ ok: true, date, reservations })
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const { date, time, menu, name, verifyToken } = body
  const partySize = Number(body.partySize)
  const phone = normalizePhone(body.phone)
  const pin = String(body.pin || '')

  if (!isValidDate(date)) return errorResponse('날짜가 올바르지 않습니다')
  if (!isValidTime(time)) return errorResponse('시간이 올바르지 않습니다')
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > MAX_PARTY_SIZE) {
    return errorResponse('인원 수가 올바르지 않습니다')
  }
  if (!menu || String(menu).trim().length === 0) return errorResponse('메뉴를 선택해주세요')
  if (!name || String(name).trim().length === 0) return errorResponse('예약자 이름을 입력해주세요')
  if (!isValidKrMobile(phone)) return errorResponse('휴대폰 번호 형식이 올바르지 않습니다')
  if (!isValidPin(pin)) return errorResponse('비밀번호는 4~6자리 숫자로 설정해주세요')
  if (!verifyToken) return errorResponse('문자 인증을 먼저 완료해주세요')

  const otpRow = await consumeVerifyToken(env, { token: verifyToken, purpose: 'booking', phone })
  if (!otpRow) return errorResponse('문자 인증이 만료되었거나 유효하지 않습니다. 다시 인증해주세요', 401)

  const pinHash = await hashSecret(pin, env.TOKEN_SECRET)
  const reservation = await createReservation(env, {
    date,
    time,
    partySize,
    menu,
    name: String(name).trim(),
    phone,
    pinHash,
  })

  const details = { date, time, partySize, menu }
  await Promise.all([
    sendSms(env, phone, bookingConfirmedMessage(details)).catch((e) => console.error(e)),
    env.OWNER_PHONE
      ? sendSms(env, env.OWNER_PHONE, bookingOwnerMessage({ ...details, name: reservation.name, phone })).catch((e) =>
          console.error(e),
        )
      : Promise.resolve(),
  ])

  return jsonResponse({
    ok: true,
    reservation: {
      id: reservation.id,
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.party_size,
      menu: reservation.menu,
      name: reservation.name,
      phone: reservation.phone,
    },
  })
}
