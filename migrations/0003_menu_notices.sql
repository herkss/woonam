-- 메뉴(menu_items) / 공지사항(notices) 관리 기능용 스키마

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items (sort_order, id);

INSERT INTO menu_items (name, price, description, image_url, sort_order) VALUES
  ('향어회', 35000, '신선한 자연산 향어를 얇게 썰어낸 감칠맛 가득한 회입니다.', '/images/hyangeohoe.jpg', 1),
  ('매운탕', 29000, '얼큰하고 진한 국물이 일품인 매운탕입니다.', '/images/maeuntang.jpg', 2);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO notices (title, content) VALUES
  ('일요일 정기 휴무 안내', '매주 일요일은 정기 휴무일입니다. 참고 부탁드립니다.'),
  ('추석 연휴 영업시간 변경 안내', '추석 연휴 기간 영업시간이 변경될 수 있습니다. 자세한 사항은 매장으로 문의해주세요.');
