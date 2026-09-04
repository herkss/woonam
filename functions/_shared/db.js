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

// 관리자(점주)용: 상태(취소 포함) 무관하게 해당 날짜의 모든 예약을 반환
export async function getAllReservationsByDate(env, date) {
  const { results } = await env.DB.prepare(`SELECT * FROM reservations WHERE date = ?1 ORDER BY time ASC`)
    .bind(date)
    .all()
  return results
}

export async function getAdminConfig(env, key) {
  const row = await env.DB.prepare(`SELECT value FROM admin_config WHERE key = ?1`).bind(key).first()
  return row ? row.value : null
}

export async function setAdminConfig(env, key, value) {
  await env.DB.prepare(
    `INSERT INTO admin_config (key, value) VALUES (?1, ?2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  )
    .bind(key, value)
    .run()
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

export async function listMenuItems(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM menu_items ORDER BY sort_order ASC, id ASC`,
  ).all()
  return results
}

export async function getMenuItem(env, id) {
  return env.DB.prepare(`SELECT * FROM menu_items WHERE id = ?1`).bind(id).first()
}

export async function createMenuItem(env, { name, price, description, imageUrl, sortOrder, category }) {
  return env.DB.prepare(
    `INSERT INTO menu_items (name, price, description, image_url, sort_order, category)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING *`,
  )
    .bind(name, price, description, imageUrl, sortOrder, category)
    .first()
}

export async function updateMenuItem(env, id, { name, price, description, imageUrl, sortOrder, category }) {
  return env.DB.prepare(
    `UPDATE menu_items
     SET name = ?2, price = ?3, description = ?4, image_url = ?5, sort_order = ?6, category = ?7, updated_at = datetime('now')
     WHERE id = ?1 RETURNING *`,
  )
    .bind(id, name, price, description, imageUrl, sortOrder, category)
    .first()
}

export async function deleteMenuItem(env, id) {
  await env.DB.prepare(`DELETE FROM menu_items WHERE id = ?1`).bind(id).run()
}

export async function listNotices(env) {
  const { results } = await env.DB.prepare(`SELECT * FROM notices ORDER BY id DESC`).all()
  return results
}

export async function getNotice(env, id) {
  return env.DB.prepare(`SELECT * FROM notices WHERE id = ?1`).bind(id).first()
}

export async function createNotice(env, { title, content }) {
  return env.DB.prepare(`INSERT INTO notices (title, content) VALUES (?1, ?2) RETURNING *`)
    .bind(title, content)
    .first()
}

export async function updateNotice(env, id, { title, content }) {
  return env.DB.prepare(
    `UPDATE notices SET title = ?2, content = ?3, updated_at = datetime('now') WHERE id = ?1 RETURNING *`,
  )
    .bind(id, title, content)
    .first()
}

export async function deleteNotice(env, id) {
  await env.DB.prepare(`DELETE FROM notices WHERE id = ?1`).bind(id).run()
}

export async function listGalleryImages(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM gallery_images ORDER BY sort_order ASC, id DESC`,
  ).all()
  return results
}

export async function getGalleryImage(env, id) {
  return env.DB.prepare(`SELECT * FROM gallery_images WHERE id = ?1`).bind(id).first()
}

export async function createGalleryImage(env, { imageUrl, title, content, sortOrder }) {
  return env.DB.prepare(
    `INSERT INTO gallery_images (image_url, title, content, sort_order) VALUES (?1, ?2, ?3, ?4) RETURNING *`,
  )
    .bind(imageUrl, title, content, sortOrder)
    .first()
}

export async function updateGalleryImage(env, id, { imageUrl, title, content, sortOrder }) {
  return env.DB.prepare(
    `UPDATE gallery_images SET image_url = ?2, title = ?3, content = ?4, sort_order = ?5 WHERE id = ?1 RETURNING *`,
  )
    .bind(id, imageUrl, title, content, sortOrder)
    .first()
}

export async function deleteGalleryImage(env, id) {
  await env.DB.prepare(`DELETE FROM gallery_images WHERE id = ?1`).bind(id).run()
}

export async function getVisitorCount(env) {
  const row = await env.DB.prepare(`SELECT value FROM admin_config WHERE key = 'visitor_count'`).first()
  return row ? Number(row.value) : 1500
}

export async function incrementVisitorCount(env) {
  const row = await env.DB.prepare(
    `INSERT INTO admin_config (key, value) VALUES ('visitor_count', '1501')
     ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1
     RETURNING value`,
  ).first()
  return Number(row.value)
}
