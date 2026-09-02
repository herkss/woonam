import { getNotice, updateNotice, deleteNotice } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, jsonResponse } from '../../_shared/validate.js'
import { formatNotice } from './index.js'

async function requireAdmin(request, env) {
  const url = new URL(request.url)
  const adminToken = request.headers.get('x-admin-token') || url.searchParams.get('adminToken')
  return verifyAdminToken(env, adminToken)
}

export async function onRequestPatch({ request, env, params }) {
  if (!(await requireAdmin(request, env))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const id = Number(params.id)
  const existing = await getNotice(env, id)
  if (!existing) return errorResponse('공지사항을 찾을 수 없습니다', 404)

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  if (!title) return errorResponse('제목을 입력해주세요')

  const row = await updateNotice(env, id, { title, content })
  return jsonResponse({ ok: true, notice: formatNotice(row) })
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const id = Number(params.id)
  const existing = await getNotice(env, id)
  if (!existing) return errorResponse('공지사항을 찾을 수 없습니다', 404)

  await deleteNotice(env, id)
  return jsonResponse({ ok: true })
}
