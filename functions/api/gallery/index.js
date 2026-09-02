import { listGalleryImages, createGalleryImage } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, isValidImageUrl, jsonResponse } from '../../_shared/validate.js'

export function formatGalleryImage(row) {
  return {
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption || '',
    createdAt: row.created_at,
  }
}

export async function onRequestGet({ env }) {
  const rows = await listGalleryImages(env)
  return jsonResponse({ ok: true, images: rows.map(formatGalleryImage) })
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

  const imageUrl = String(body.imageUrl || '').trim()
  const caption = String(body.caption || '').trim()

  if (!imageUrl) return errorResponse('사진을 선택해주세요')
  if (!isValidImageUrl(imageUrl)) return errorResponse('사진 용량이 너무 큽니다. 더 작은 사진을 사용해주세요')

  const row = await createGalleryImage(env, { imageUrl, caption, sortOrder: 0 })
  return jsonResponse({ ok: true, image: formatGalleryImage(row) })
}
