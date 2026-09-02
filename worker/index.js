// Cloudflare Workers 진입점.
// 정적 파일(dist)은 [assets] 설정이 자동으로 서빙하고, /api/* 요청만 이 Worker가 처리한다
// (wrangler.toml의 run_worker_first = ["/api/*"] 설정).
// 각 API 로직 자체는 functions/ 아래에 있는 파일을 그대로 재사용한다.

import * as otpRequest from '../functions/api/otp/request.js'
import * as otpVerify from '../functions/api/otp/verify.js'
import * as reservations from '../functions/api/reservations/index.js'
import * as reservationLookup from '../functions/api/reservations/lookup.js'
import * as reservationById from '../functions/api/reservations/[id].js'
import * as adminLogin from '../functions/api/admin/login.js'
import * as adminChangePassword from '../functions/api/admin/change-password.js'
import * as adminReservations from '../functions/api/admin/reservations.js'
import * as menuIndex from '../functions/api/menu/index.js'
import * as menuById from '../functions/api/menu/[id].js'
import * as noticesIndex from '../functions/api/notices/index.js'
import * as noticesById from '../functions/api/notices/[id].js'
import * as galleryIndex from '../functions/api/gallery/index.js'
import * as galleryById from '../functions/api/gallery/[id].js'
import { errorResponse } from '../functions/_shared/validate.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method

    try {
      if (pathname === '/api/otp/request' && method === 'POST') {
        return await otpRequest.onRequestPost({ request, env })
      }
      if (pathname === '/api/otp/verify' && method === 'POST') {
        return await otpVerify.onRequestPost({ request, env })
      }
      if (pathname === '/api/reservations' && method === 'GET') {
        return await reservations.onRequestGet({ request, env })
      }
      if (pathname === '/api/reservations' && method === 'POST') {
        return await reservations.onRequestPost({ request, env })
      }
      if (pathname === '/api/reservations/lookup' && method === 'POST') {
        return await reservationLookup.onRequestPost({ request, env })
      }

      const idMatch = pathname.match(/^\/api\/reservations\/([^/]+)$/)
      if (idMatch) {
        const params = { id: idMatch[1] }
        if (method === 'PATCH') return await reservationById.onRequestPatch({ request, env, params })
        if (method === 'DELETE') return await reservationById.onRequestDelete({ request, env, params })
      }

      if (pathname === '/api/admin/login' && method === 'POST') {
        return await adminLogin.onRequestPost({ request, env })
      }
      if (pathname === '/api/admin/change-password' && method === 'POST') {
        return await adminChangePassword.onRequestPost({ request, env })
      }
      if (pathname === '/api/admin/reservations' && method === 'GET') {
        return await adminReservations.onRequestGet({ request, env })
      }

      if (pathname === '/api/menu' && method === 'GET') {
        return await menuIndex.onRequestGet({ request, env })
      }
      if (pathname === '/api/menu' && method === 'POST') {
        return await menuIndex.onRequestPost({ request, env })
      }
      const menuIdMatch = pathname.match(/^\/api\/menu\/([^/]+)$/)
      if (menuIdMatch) {
        const params = { id: menuIdMatch[1] }
        if (method === 'PATCH') return await menuById.onRequestPatch({ request, env, params })
        if (method === 'DELETE') return await menuById.onRequestDelete({ request, env, params })
      }

      if (pathname === '/api/notices' && method === 'GET') {
        return await noticesIndex.onRequestGet({ request, env })
      }
      if (pathname === '/api/notices' && method === 'POST') {
        return await noticesIndex.onRequestPost({ request, env })
      }
      const noticeIdMatch = pathname.match(/^\/api\/notices\/([^/]+)$/)
      if (noticeIdMatch) {
        const params = { id: noticeIdMatch[1] }
        if (method === 'PATCH') return await noticesById.onRequestPatch({ request, env, params })
        if (method === 'DELETE') return await noticesById.onRequestDelete({ request, env, params })
      }

      if (pathname === '/api/gallery' && method === 'GET') {
        return await galleryIndex.onRequestGet({ request, env })
      }
      if (pathname === '/api/gallery' && method === 'POST') {
        return await galleryIndex.onRequestPost({ request, env })
      }
      const galleryIdMatch = pathname.match(/^\/api\/gallery\/([^/]+)$/)
      if (galleryIdMatch) {
        const params = { id: galleryIdMatch[1] }
        if (method === 'PATCH') return await galleryById.onRequestPatch({ request, env, params })
        if (method === 'DELETE') return await galleryById.onRequestDelete({ request, env, params })
      }
    } catch (err) {
      console.error(err)
      return errorResponse('서버 오류가 발생했습니다', 500)
    }

    if (pathname.startsWith('/api/')) {
      return errorResponse('요청한 API를 찾을 수 없습니다', 404)
    }

    return env.ASSETS.fetch(request)
  },
}
