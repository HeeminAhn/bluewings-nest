-- 댓글에 부모 댓글 ID 추가 (대댓글 기능)
ALTER TABLE comments ADD COLUMN parent_id BIGINT NULL;
ALTER TABLE comments ADD CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;

-- 대댓글 조회용 인덱스
CREATE INDEX idx_comments_parent ON comments(parent_id);
