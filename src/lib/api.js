async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    method: options?.method || 'GET',
    headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다')
  }
  return data
}

export function requestOtp(phone, purpose) {
  return request('/otp/request', { method: 'POST', body: { phone, purpose } })
}

export function verifyOtp(phone, purpose, code) {
  return request('/otp/verify', { method: 'POST', body: { phone, purpose, code } })
}

export function fetchReservationsByDate(date) {
  return request(`/reservations?date=${encodeURIComponent(date)}`)
}

export function fetchReservedDatesInMonth(monthKey) {
  return request(`/reservations?month=${encodeURIComponent(monthKey)}`)
}

export function createReservation(payload) {
  return request('/reservations', { method: 'POST', body: payload })
}

export function lookupReservations(payload) {
  return request('/reservations/lookup', { method: 'POST', body: payload })
}

export function updateReservation(id, payload) {
  return request(`/reservations/${id}`, { method: 'PATCH', body: payload })
}

export function cancelReservation(id, payload) {
  return request(`/reservations/${id}`, { method: 'DELETE', body: payload })
}

export function adminLogin(password) {
  return request('/admin/login', { method: 'POST', body: { password } })
}

export function adminChangePassword(payload) {
  return request('/admin/change-password', { method: 'POST', body: payload })
}

export function fetchAdminReservations(date, adminToken) {
  return request(`/admin/reservations?date=${encodeURIComponent(date)}`, {
    headers: { 'x-admin-token': adminToken },
  })
}
