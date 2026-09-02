-- 메뉴 분류(회/매운탕/찜/주류/토종닭/튀김/주류기타) 컬럼 추가

ALTER TABLE menu_items ADD COLUMN category TEXT NOT NULL DEFAULT '회';

UPDATE menu_items SET category = '회' WHERE name = '향어회';
UPDATE menu_items SET category = '매운탕' WHERE name = '매운탕';
