-- 점주/관리자 설정 (비밀번호 해시, 로그인 실패 잠금 상태 등) 저장용 key-value 테이블

CREATE TABLE IF NOT EXISTS admin_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
