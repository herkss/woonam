// D1 쿼리 헬퍼 모음 (env.DB 바인딩 사용)

export async function insertOtp(env, { phone, purpose, codeHash, expiresAt }) {
  const result = await env.DB.prepare(
    `INSERT INTO otp_codes (phone, purpose, code_hash, expires_at) VALUES (?1, ?2, ?3, ?4) RETURNING id`,
  )
    .bind(phone, purpose, codeHash, expiresAt)
    .first()
  return result.id
}

export async function getLatestOtp(env, phone, purpose) {
  return env.DB.prepare(
    `SELECT * FROM otp_codes WHERE phone = ?1 AND purpose = ?2 ORDER BY id DESC LIMIT 1`,
  )
    .bind(phone, purpose)
    .first()
}

export async function incrementOtpAttempts(env, id) {
  await env.DB.prepare(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?1`).bind(id).run()
}

export async function markOtpVerified(env, id, verifyToken) {
  await env.DB.prepare(
    `UPDATE otp_codes SET verified_at = datetime('now'), verify_token = ?2 WHERE id = ?1`,
  )
    .bind(id, verifyToken)
    .run()
}

// 인증 토큰을 검증하고(만료 15분, 1회용) 성공 시 소모 처리
export async function consumeVerifyToken(env, { token, purpose, phone }) {
  const row = await env.DB.prepare(
    `SELECT * FROM otp_codes
     WHERE verify_token = ?1 AND purpose = ?2 AND phone = ?3
       AND token_used = 0 AND verified_at IS NOT NULL
       AND verified_at >= datetime('now', '-15 minutes')
     LIMIT 1`,
  )
    .bind(token, purpose, phone)
    .first()

  if (!row) return null

  await env.DB.prepare(`UPDATE otp_codes SET token_used = 1 WHERE id = ?1`).bind(row.id).run()
  return row
}

export async function createReservation(env, { date, time, partySize, menu, name, phone, pinHash }) {
  const result = await env.DB.prepare(
    `INSERT INTO reservations (date, time, party_size, menu, name, phone, pin_hash)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) RETURNING *`,
  )
    .bind(date, time, partySize, menu, name, phone, pinHash)
    .first()
  return result
}

export async function getReservationsByDate(env, date) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM reservations WHERE date = ?1 AND status = 'confirmed' ORDER BY time ASC`,
  )
    .bind(date)
    .all()
  return results
}

export async function getReservedDatesInMonth(env, monthPrefix) {
  const { results } = await env.DB.prepare(
    `SELECT DISTINCT date FROM reservations WHERE date LIKE ?1 AND status = 'confirmed' ORDER BY date ASC`,
  )
    .bind(`${monthPrefix}-%`)
    .all()
  return results.map((r) => r.date)
}

export async function getReservationsByPhone(env, phone) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM reservations WHERE phone = ?1 AND status = 'confirmed' ORDER BY date ASC, time ASC`,
  )
    .bind(phone)
    .all()
  return results
}

export async function getReservationById(env, id) {
  return env.DB.prepare(`SELECT * FROM reservations WHERE id = ?1`).bind(id).first()
}

export async function updateReservation(env, id, { date, time, partySize, menu }) {
  return env.DB.prepare(
    `UPDATE reservations
     SET date = ?2, time = ?3, party_size = ?4, menu = ?5, updated_at = datetime('now')
     WHERE id = ?1 RETURNING *`,
  )
    .bind(id, date, time, partySize, menu)
    .first()
}

export async function cancelReservation(env, id) {
  await env.DB.prepare(
    `UPDATE reservations SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?1`,
  )
    .bind(id)
    .run()
}
