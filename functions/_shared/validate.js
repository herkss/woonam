export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '')
}

export function isValidKrMobile(digits) {
  return /^01[016789]\d{7,8}$/.test(digits)
}

export function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))
}

export function isValidMonth(monthStr) {
  return /^\d{4}-\d{2}$/.test(String(monthStr || ''))
}

export function isValidTime(timeStr) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(timeStr || ''))
}

export function isValidPin(pin) {
  return /^\d{4,6}$/.test(String(pin || ''))
}

export function isValidOtpCode(code) {
  return /^\d{6}$/.test(String(code || ''))
}

// 한국 시간(KST) 기준 오늘 날짜 (YYYY-MM-DD)
export function todayKstDateKey() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
  })
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ ok: false, error: message }, { status })
}
