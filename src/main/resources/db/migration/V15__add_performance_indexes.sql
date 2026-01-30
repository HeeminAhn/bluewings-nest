-- 성능 최적화를 위한 인덱스 추가

-- ============================================================
-- posts 테이블
-- ============================================================

-- 카테고리별 게시글 조회 (V12에서 컬럼 추가했으나 인덱스 누락)
CREATE INDEX idx_posts_category_id ON posts(category_id);

-- 인기글 조회 최적화 (조회수, 좋아요수 정렬)
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX idx_posts_like_count ON posts(like_count DESC);

-- 카테고리별 최신글 조회 (복합 인덱스)
CREATE INDEX idx_posts_category_created ON posts(category_id, created_at DESC);

-- ============================================================
-- comments 테이블
-- ============================================================

-- 댓글 정렬 최적화
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- 대댓글 조회 최적화 (V5에서 parent_id 추가)
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- 게시글별 댓글 최신순 조회 (복합 인덱스)
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at);

-- ============================================================
-- post_views 테이블
-- ============================================================

-- 회원별 조회 여부 체크 최적화 (복합 인덱스)
CREATE INDEX idx_post_views_post_member ON post_views(post_id, member_id);

-- IP별 조회 체크 (비회원용)
CREATE INDEX idx_post_views_post_ip ON post_views(post_id, ip_address);

-- ============================================================
-- chat_messages 테이블
-- ============================================================

-- 회원별 메시지 조회 (어드민 검색용)
CREATE INDEX idx_chat_messages_member_id ON chat_messages(member_id);

-- ============================================================
-- categories 테이블
-- ============================================================

-- 활성 카테고리 정렬 조회
CREATE INDEX idx_categories_active_order ON categories(is_active, display_order);

-- ============================================================
-- notices 테이블
-- ============================================================

-- 고정공지 + 최신순 정렬 (복합 인덱스)
CREATE INDEX idx_notices_pinned_created ON notices(is_pinned DESC, created_at DESC);

-- ============================================================
-- matches 테이블
-- ============================================================

-- 다가오는 경기 조회 (상태 + 날짜)
CREATE INDEX idx_matches_status_date ON matches(status, match_date);

-- 시즌별 경기 날짜순 조회
CREATE INDEX idx_matches_season_date ON matches(season, match_date);
