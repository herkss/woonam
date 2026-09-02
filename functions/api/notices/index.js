import { listNotices, createNotice } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, jsonResponse } from '../../_shared/validate.js'

export function formatNotice(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    createdAt: row.created_at,
    dateLabel: String(row.created_at || '').slice(0, 10).replace(/-/g, '.'),
  }
}

export async function onRequestGet({ env }) {
  const rows = await listNotices(env)
  return jsonResponse({ ok: true, notices: rows.map(formatNotice) })
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const adminToken = request.headers.get('x-admin-token') || body.adminToken
  if (!(await verifyAdminToken(env, adminToken))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  if (!title) return errorResponse('제목을 입력해주세요')

  const row = await createNotice(env, { title, content })
  return jsonResponse({ ok: true, notice: formatNotice(row) })
}
