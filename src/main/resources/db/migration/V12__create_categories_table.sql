-- 카테고리 테이블 생성
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- posts 테이블에 category_id 컬럼 추가
ALTER TABLE posts ADD COLUMN category_id BIGINT;
ALTER TABLE posts ADD CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- 초기 카테고리 데이터 삽입
INSERT INTO categories (name, description, display_order, is_active) VALUES
('자유', '자유로운 주제의 이야기', 1, TRUE),
('경기', '경기 전/후 이야기, 분석', 2, TRUE),
('선수', '선수 관련 소식, 응원', 3, TRUE),
('이적/루머', '이적 시장 소식', 4, TRUE),
('직관', '직관 후기, 원정 모임', 5, TRUE),
('질문', '새 팬 질문, 정보 공유', 6, TRUE),
('굿즈/티켓', '굿즈, 티켓 관련', 7, TRUE);
