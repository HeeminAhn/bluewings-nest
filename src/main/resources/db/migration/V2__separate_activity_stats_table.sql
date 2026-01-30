-- Create member_activity_stats table
CREATE TABLE member_activity_stats (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL UNIQUE,
    post_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    attendance_count INT NOT NULL DEFAULT 0,
    last_attendance_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_stats_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Migrate existing data from members to member_activity_stats
INSERT INTO member_activity_stats (member_id, post_count, comment_count, like_count, attendance_count, last_attendance_date, created_at, updated_at)
SELECT id, post_count, comment_count, like_count, attendance_count, last_attendance_date, created_at, updated_at
FROM members;

-- Remove activity columns from members table
ALTER TABLE members DROP COLUMN post_count;
ALTER TABLE members DROP COLUMN comment_count;
ALTER TABLE members DROP COLUMN like_count;
ALTER TABLE members DROP COLUMN attendance_count;
ALTER TABLE members DROP COLUMN last_attendance_date;

-- Create index for member_id lookup
CREATE INDEX idx_activity_stats_member_id ON member_activity_stats(member_id);
