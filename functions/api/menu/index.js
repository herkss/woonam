import { listMenuItems, createMenuItem } from '../../_shared/db.js'
import { verifyAdminToken } from '../../_shared/admin.js'
import { errorResponse, isValidImageUrl, jsonResponse } from '../../_shared/validate.js'
import { MENU_CATEGORIES } from '../../../src/lib/menuCategories.js'

export function formatMenuItem(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    priceLabel: `${Number(row.price).toLocaleString('ko-KR')}원`,
    description: row.description || '',
    imageUrl: row.image_url || '',
    sortOrder: row.sort_order,
    category: row.category,
  }
}

export async function onRequestGet({ env }) {
  const rows = await listMenuItems(env)
  return jsonResponse({ ok: true, items: rows.map(formatMenuItem) })
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

  const name = String(body.name || '').trim()
  const price = Number(body.price)
  const description = String(body.description || '').trim()
  const imageUrl = String(body.imageUrl || '').trim()
  const category = String(body.category || '')

  if (!name) return errorResponse('메뉴명을 입력해주세요')
  if (!Number.isInteger(price) || price < 0) return errorResponse('가격이 올바르지 않습니다')
  if (!isValidImageUrl(imageUrl)) return errorResponse('이미지 용량이 너무 큽니다. 더 작은 사진을 사용해주세요')
  if (!MENU_CATEGORIES.includes(category)) return errorResponse('메뉴 분류를 선택해주세요')

  const row = await createMenuItem(env, {
    name,
    price,
    description,
    imageUrl: imageUrl || null,
    sortOrder: 0,
    category,
  })
  return jsonResponse({ ok: true, item: formatMenuItem(row) })
}
