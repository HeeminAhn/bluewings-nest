-- Increase refresh_token column length to accommodate JWT tokens
ALTER TABLE members ALTER COLUMN refresh_token TYPE VARCHAR(2000);
