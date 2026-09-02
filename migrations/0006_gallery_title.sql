-- 갤러리 사진에 제목/내용 입력 지원 (기존 caption 컬럼을 content로 정리하고 title 추가)

ALTER TABLE gallery_images RENAME COLUMN caption TO content;
ALTER TABLE gallery_images ADD COLUMN title TEXT NOT NULL DEFAULT '';
