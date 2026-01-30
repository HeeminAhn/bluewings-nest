-- 카테고리에 색상 컬럼 추가
ALTER TABLE categories ADD COLUMN color VARCHAR(20) DEFAULT 'gray';

-- 기존 카테고리에 색상 설정
UPDATE categories SET color = 'gray' WHERE name = '자유';
UPDATE categories SET color = 'blue' WHERE name = '경기';
UPDATE categories SET color = 'green' WHERE name = '선수';
UPDATE categories SET color = 'purple' WHERE name = '이적/루머';
UPDATE categories SET color = 'orange' WHERE name = '직관';
UPDATE categories SET color = 'yellow' WHERE name = '질문';
UPDATE categories SET color = 'pink' WHERE name = '굿즈/티켓';
