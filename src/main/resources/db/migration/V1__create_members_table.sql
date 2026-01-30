-- Members table
CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(30) NOT NULL UNIQUE,
    profile_image_url VARCHAR(200),
    bio VARCHAR(500),
    grade VARCHAR(20) NOT NULL DEFAULT 'ROOKIE',
    post_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    attendance_count INT NOT NULL DEFAULT 0,
    last_attendance_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_nickname ON members(nickname);
CREATE INDEX idx_members_grade ON members(grade);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_created_at ON members(created_at);
