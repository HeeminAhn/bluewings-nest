-- Add role column to members table
ALTER TABLE members ADD COLUMN role VARCHAR(20) DEFAULT 'USER';
UPDATE members SET role = 'USER' WHERE role IS NULL;
ALTER TABLE members ALTER COLUMN role SET NOT NULL;
ALTER TABLE members ALTER COLUMN role SET DEFAULT 'USER';

-- Create notices table
CREATE TABLE notices (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    view_count INT DEFAULT 0 NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notices_member FOREIGN KEY (member_id) REFERENCES members(id)
);

-- Create notice_images table
CREATE TABLE notice_images (
    id BIGSERIAL PRIMARY KEY,
    notice_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notice_images_notice FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_notices_is_pinned ON notices(is_pinned);
CREATE INDEX idx_notices_created_at ON notices(created_at);
CREATE INDEX idx_notices_member_id ON notices(member_id);
CREATE INDEX idx_notice_images_notice_id ON notice_images(notice_id);
