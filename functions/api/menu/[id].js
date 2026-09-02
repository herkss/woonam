import { getMenuItem, updateMenuItem, deleteMenuItem } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, isValidImageUrl, jsonResponse } from '../../_shared/validate.js'
import { formatMenuItem } from './index.js'

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
  const existing = await getMenuItem(env, id)
  if (!existing) return errorResponse('메뉴를 찾을 수 없습니다', 404)

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const name = String(body.name || '').trim()
  const price = Number(body.price)
  const description = String(body.description || '').trim()
  const imageUrl = String(body.imageUrl || '').trim()

  if (!name) return errorResponse('메뉴명을 입력해주세요')
  if (!Number.isInteger(price) || price < 0) return errorResponse('가격이 올바르지 않습니다')
  if (!isValidImageUrl(imageUrl)) return errorResponse('이미지 용량이 너무 큽니다. 더 작은 사진을 사용해주세요')

  const row = await updateMenuItem(env, id, {
    name,
    price,
    description,
    imageUrl: imageUrl || null,
    sortOrder: existing.sort_order,
  })
  return jsonResponse({ ok: true, item: formatMenuItem(row) })
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const id = Number(params.id)
  const existing = await getMenuItem(env, id)
  if (!existing) return errorResponse('메뉴를 찾을 수 없습니다', 404)

  await deleteMenuItem(env, id)
  return jsonResponse({ ok: true })
}
