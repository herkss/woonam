-- 운암상회 예약 시스템 초기 스키마

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,               -- 'YYYY-MM-DD'
  time TEXT NOT NULL,               -- 'HH:MM'
  party_size INTEGER NOT NULL,
  menu TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,              -- 숫자만 저장 (01012345678)
  pin_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations (date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations (phone, status);

CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,            -- booking | manage
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  verified_at TEXT,
  verify_token TEXT,
  token_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON otp_codes (phone, purpose, created_at);
CREATE INDEX IF NOT EXISTS idx_otp_verify_token ON otp_codes (verify_token);
