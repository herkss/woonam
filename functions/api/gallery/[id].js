import { getGalleryImage, deleteGalleryImage } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, jsonResponse } from '../../_shared/validate.js'

export async function onRequestDelete({ request, env, params }) {
  const url = new URL(request.url)
  const adminToken = request.headers.get('x-admin-token') || url.searchParams.get('adminToken')
  if (!(await verifyAdminToken(env, adminToken))) {
    return errorResponse('로그인이 만료되었습니다. 다시 로그인해주세요', 401)
  }

  const id = Number(params.id)
  const existing = await getGalleryImage(env, id)
  if (!existing) return errorResponse('사진을 찾을 수 없습니다', 404)

  await deleteGalleryImage(env, id)
  return jsonResponse({ ok: true })
}
