-- 게시글 조회 이력 테이블
CREATE TABLE post_views (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    member_id BIGINT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_views_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_views_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_post_views_post_id ON post_views(post_id);
CREATE INDEX idx_post_views_member_id ON post_views(member_id);
CREATE INDEX idx_post_views_created_at ON post_views(created_at);
