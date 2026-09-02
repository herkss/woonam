import { getGalleryImage, updateGalleryImage, deleteGalleryImage } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, isValidImageUrl, jsonResponse } from '../../_shared/validate.js'
import { formatGalleryImage } from './index.js'

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
  const existing = await getGalleryImage(env, id)
  if (!existing) return errorResponse('사진을 찾을 수 없습니다', 404)

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('잘못된 요청입니다')
  }

  const imageUrl = String(body.imageUrl || '').trim() || existing.image_url
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()

  if (!isValidImageUrl(imageUrl)) return errorResponse('사진 용량이 너무 큽니다. 더 작은 사진을 사용해주세요')

  const row = await updateGalleryImage(env, id, {
    imageUrl,
    title,
    content,
    sortOrder: existing.sort_order,
  })
  return jsonResponse({ ok: true, image: formatGalleryImage(row) })
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await requireAdmin(request, env))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const id = Number(params.id)
  const existing = await getGalleryImage(env, id)
  if (!existing) return errorResponse('사진을 찾을 수 없습니다', 404)

  await deleteGalleryImage(env, id)
  return jsonResponse({ ok: true })
}
