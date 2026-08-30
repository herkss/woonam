// Cloudflare Workers 진입점.
// 정적 파일(dist)은 [assets] 설정이 자동으로 서빙하고, /api/* 요청만 이 Worker가 처리한다
// (wrangler.toml의 run_worker_first = ["/api/*"] 설정).
// 각 API 로직 자체는 functions/ 아래에 있는 파일을 그대로 재사용한다.

import * as otpRequest from '../functions/api/otp/request.js'
import * as otpVerify from '../functions/api/otp/verify.js'
import * as reservations from '../functions/api/reservations/index.js'
import * as reservationLookup from '../functions/api/reservations/lookup.js'
import * as reservationById from '../functions/api/reservations/[id].js'
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
