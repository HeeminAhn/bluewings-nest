-- 게시글 soft delete를 위한 deleted_at 컬럼 추가
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;

-- 삭제된 게시글 조회 성능을 위한 인덱스
CREATE INDEX idx_posts_deleted_at ON posts(deleted_at);
