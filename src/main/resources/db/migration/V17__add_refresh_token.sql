-- Add refresh token columns to members table
ALTER TABLE members ADD COLUMN refresh_token VARCHAR(500);
ALTER TABLE members ADD COLUMN refresh_token_expires_at TIMESTAMPTZ;

-- Index for refresh token lookup (partial index for non-null values only)
CREATE INDEX idx_members_refresh_token ON members(refresh_token) WHERE refresh_token IS NOT NULL;
