-- Add block fields to members table
ALTER TABLE members ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE members ADD COLUMN blocked_at TIMESTAMP NULL;
ALTER TABLE members ADD COLUMN blocked_reason VARCHAR(500) NULL;
ALTER TABLE members ADD COLUMN blocked_until TIMESTAMP NULL;
ALTER TABLE members ADD COLUMN report_count INT NOT NULL DEFAULT 0;

CREATE INDEX idx_members_is_blocked ON members(is_blocked);

-- Create member access logs table
CREATE TABLE member_access_logs (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NULL,
    email VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    is_success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_access_logs_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_access_logs_member_id ON member_access_logs(member_id);
CREATE INDEX idx_access_logs_ip_address ON member_access_logs(ip_address);
CREATE INDEX idx_access_logs_created_at ON member_access_logs(created_at);
CREATE INDEX idx_access_logs_is_success ON member_access_logs(is_success);

-- Create member reports table
CREATE TABLE member_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    reported_member_id BIGINT NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    content_type VARCHAR(20),
    content_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    processed_by BIGINT,
    admin_note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES members(id),
    CONSTRAINT fk_reports_reported FOREIGN KEY (reported_member_id) REFERENCES members(id),
    CONSTRAINT fk_reports_processor FOREIGN KEY (processed_by) REFERENCES members(id)
);

CREATE INDEX idx_reports_reporter_id ON member_reports(reporter_id);
CREATE INDEX idx_reports_reported_member_id ON member_reports(reported_member_id);
CREATE INDEX idx_reports_status ON member_reports(status);
CREATE INDEX idx_reports_created_at ON member_reports(created_at);
CREATE INDEX idx_reports_content ON member_reports(content_type, content_id);
