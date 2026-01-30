-- 채팅 메시지 테이블 생성
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 인덱스 생성 (최신순 조회 최적화)
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
