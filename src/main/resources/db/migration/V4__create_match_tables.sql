-- 경기 정보 테이블
CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    match_date DATE NOT NULL,
    match_time TIME,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    home_score INT,
    away_score INT,
    stadium VARCHAR(200),
    competition VARCHAR(100) NOT NULL DEFAULT 'K리그1',
    season VARCHAR(20) NOT NULL,
    match_day INT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_match_date ON matches(match_date);
CREATE INDEX idx_season ON matches(season);
CREATE INDEX idx_status ON matches(status);

-- 리그 순위 테이블
CREATE TABLE league_standings (
    id BIGSERIAL PRIMARY KEY,
    season VARCHAR(20) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    position INT NOT NULL,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    goal_difference INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_season_team UNIQUE (season, team_name)
);

CREATE INDEX idx_season_position ON league_standings(season, position);

-- 샘플 데이터: 2025 시즌 경기 일정
INSERT INTO matches (match_date, match_time, home_team, away_team, home_score, away_score, stadium, competition, season, match_day, status) VALUES
('2025-03-01', '14:00:00', '수원 삼성', 'FC 서울', 2, 1, '수원월드컵경기장', 'K리그1', '2025', 1, 'FINISHED'),
('2025-03-08', '16:30:00', '전북 현대', '수원 삼성', 1, 1, '전주월드컵경기장', 'K리그1', '2025', 2, 'FINISHED'),
('2025-03-15', '14:00:00', '수원 삼성', '울산 현대', 0, 2, '수원월드컵경기장', 'K리그1', '2025', 3, 'FINISHED'),
('2025-03-22', '16:30:00', '포항 스틸러스', '수원 삼성', NULL, NULL, '포항스틸야드', 'K리그1', '2025', 4, 'SCHEDULED'),
('2025-03-29', '14:00:00', '수원 삼성', '대구 FC', NULL, NULL, '수원월드컵경기장', 'K리그1', '2025', 5, 'SCHEDULED'),
('2025-04-05', '16:30:00', '인천 유나이티드', '수원 삼성', NULL, NULL, '인천축구전용경기장', 'K리그1', '2025', 6, 'SCHEDULED'),
('2025-04-12', '14:00:00', '수원 삼성', '강원 FC', NULL, NULL, '수원월드컵경기장', 'K리그1', '2025', 7, 'SCHEDULED');

-- 샘플 데이터: 2025 시즌 순위표
INSERT INTO league_standings (season, team_name, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points) VALUES
('2025', '울산 현대', 1, 3, 3, 0, 0, 7, 2, 5, 9),
('2025', '전북 현대', 2, 3, 2, 1, 0, 5, 2, 3, 7),
('2025', 'FC 서울', 3, 3, 2, 0, 1, 4, 3, 1, 6),
('2025', '포항 스틸러스', 4, 3, 1, 2, 0, 4, 3, 1, 5),
('2025', '수원 삼성', 5, 3, 1, 1, 1, 3, 4, -1, 4),
('2025', '대구 FC', 6, 3, 1, 1, 1, 3, 4, -1, 4),
('2025', '인천 유나이티드', 7, 3, 1, 0, 2, 3, 5, -2, 3),
('2025', '강원 FC', 8, 3, 1, 0, 2, 2, 4, -2, 3),
('2025', '제주 유나이티드', 9, 3, 0, 2, 1, 2, 4, -2, 2),
('2025', '광주 FC', 10, 3, 0, 1, 2, 2, 5, -3, 1),
('2025', '김천 상무', 11, 3, 0, 1, 2, 1, 4, -3, 1),
('2025', '대전 하나', 12, 3, 0, 1, 2, 1, 5, -4, 1);
