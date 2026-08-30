import { getAllReservationsByDate } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { isValidDate, errorResponse, jsonResponse } from '../../_shared/validate.js'
import { formatTimeLabel } from '../../../src/lib/mask.js'

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const adminToken = request.headers.get('x-admin-token') || url.searchParams.get('adminToken')

  if (!(await verifyAdminToken(env, adminToken))) return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  if (!isValidDate(date)) return errorResponse('date 파라미터가 필요합니다 (YYYY-MM-DD)')

  const rows = await getAllReservationsByDate(env, date)
  const reservations = rows.map((r) => ({
    id: r.id,
    time: r.time,
    timeLabel: formatTimeLabel(r.time),
    partySize: r.party_size,
    menu: r.menu,
    name: r.name,
    phone: r.phone,
    status: r.status,
  }))

  return jsonResponse({ ok: true, date, reservations })
}
