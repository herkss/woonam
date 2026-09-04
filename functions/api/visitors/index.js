import { getVisitorCount, incrementVisitorCount } from '../../_shared/db.js'
import { jsonResponse } from '../../_shared/validate.js'

export async function onRequestGet({ env }) {
  const count = await getVisitorCount(env)
  return jsonResponse({ ok: true, count })
}

export async function onRequestPost({ env }) {
  const count = await incrementVisitorCount(env)
  return jsonResponse({ ok: true, count })
}
