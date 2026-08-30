import { cancelReservation, consumeVerifyToken, getReservationById, updateReservation } from '../../_shared/db.js'
import { hashSecret } from '../../_shared/crypto.js'
import { sendSms, bookingUpdatedMessage, bookingCancelledMessage, bookingOwnerMessage } from '../../_shared/sms.js'
import { normalizePhone, isValidDate, isValidTime, errorResponse, jsonResponse } from '../../_shared/validate.js'

const MAX_PARTY_SIZE = 20

async function verifyOwnership(env, reservation, { phone, pin, verifyToken }) {
  if (reservation.phone !== phone) return false
  if (verifyToken) {
    const otpRow = await consumeVerifyToken(env, { token: verifyToken, purpose: 'manage', phone })
    return Boolean(otpRow)
  }
  if (pin) {
    const pinHash = await hashSecret(pin, env.TOKEN_SECRET)
    return pinHash === reservation.pin_hash
  }
  return false
}

export async function onRequestPatch({ request, env, params }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const reservation = await getReservationById(env, params.id)
  if (!reservation || reservation.status !== 'confirmed') return errorResponse('예약을 찾을 수 없습니다', 404)

  const phone = normalizePhone(body.phone)
  const ok = await verifyOwnership(env, reservation, { phone, pin: body.pin, verifyToken: body.verifyToken })
  if (!ok) return errorResponse('본인 확인에 실패했습니다', 401)

  const date = isValidDate(body.date) ? body.date : reservation.date
  const time = isValidTime(body.time) ? body.time : reservation.time
  const partySize = Number.isInteger(Number(body.partySize)) ? Number(body.partySize) : reservation.party_size
  const menu = body.menu ? String(body.menu).trim() : reservation.menu

  if (partySize < 1 || partySize > MAX_PARTY_SIZE) return errorResponse('인원 수가 올바르지 않습니다')

  const updated = await updateReservation(env, reservation.id, { date, time, partySize, menu })

  const details = { date, time, partySize, menu }
  await Promise.all([
    sendSms(env, phone, bookingUpdatedMessage(details)).catch((e) => console.error(e)),
    env.OWNER_PHONE
      ? sendSms(env, env.OWNER_PHONE, bookingOwnerMessage({ ...details, name: updated.name, phone })).catch((e) =>
          console.error(e),
        )
      : Promise.resolve(),
  ])

  return jsonResponse({
    ok: true,
    reservation: {
      id: updated.id,
      date: updated.date,
      time: updated.time,
      partySize: updated.party_size,
      menu: updated.menu,
      name: updated.name,
      phone: updated.phone,
    },
  })
}

export async function onRequestDelete({ request, env, params }) {
  let body
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const reservation = await getReservationById(env, params.id)
  if (!reservation || reservation.status !== 'confirmed') return errorResponse('예약을 찾을 수 없습니다', 404)

  const phone = normalizePhone(body.phone)
  const ok = await verifyOwnership(env, reservation, { phone, pin: body.pin, verifyToken: body.verifyToken })
  if (!ok) return errorResponse('본인 확인에 실패했습니다', 401)

  await cancelReservation(env, reservation.id)

  const details = { date: reservation.date, time: reservation.time }
  await Promise.all([
    sendSms(env, phone, bookingCancelledMessage(details)).catch((e) => console.error(e)),
    env.OWNER_PHONE
      ? sendSms(
          env,
          env.OWNER_PHONE,
          `[운암상회 예약취소] ${reservation.date} ${reservation.time} / ${reservation.name} (${phone})`,
        ).catch((e) => console.error(e))
      : Promise.resolve(),
  ])

  return jsonResponse({ ok: true })
}
