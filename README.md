# Bluewings Nest

수원 삼성 블루윙즈 팬 커뮤니티 플랫폼

## Tech Stack

| 구분 | 기술 |
|------|------|
| **Backend** | Quarkus 3.30 (Kotlin), Hibernate ORM, Flyway |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS |
| **Admin** | Next.js 16, shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (SmallRye JWT) |
| **Infra** | Docker, Cloudflare Tunnel |

## Features

- **회원 시스템**: 등급 진행 (ROOKIE → SUPPORTER → FANATIC → ULTRAS → LEGEND)
- **커뮤니티**: 게시글, 댓글, 좋아요, 카테고리
- **실시간 채팅**: WebSocket 기반 (30분/100개 제한)
- **경기 정보**: 일정, 순위표
- **공지사항**: 관리자 공지
- **신고 시스템**: 부적절한 콘텐츠 신고
- **출석체크**: 포츈쿠키 메시지

## Architecture

모듈러 모놀리스 아키텍처 적용 - 자세한 내용은 [ARCHITECTURE.md](src/main/kotlin/com/bluewings/ARCHITECTURE.md) 참조

```
com.bluewings/
├── shared/          # 공유 커널 (EventBus, DomainEvent)
├── member/          # 회원 모듈
├── community/       # 커뮤니티 모듈 (게시글, 댓글)
├── chat/            # 채팅 모듈
├── notice/          # 공지사항 모듈
├── match/           # 경기 정보 모듈
├── report/          # 신고 모듈
└── admin/           # 어드민 API
```

## Prerequisites

- Java 21+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (또는 Supabase)

## Setup

### 1. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
# Database Configuration (Supabase)
DB_USERNAME=postgres.your-project-ref
DB_PASSWORD=your-database-password
DB_URL=jdbc:postgresql://your-host:6543/postgres?prepareThreshold=0

# Cloudflare Tunnel Token (optional, for production)
CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token
```

### 2. JWT 키 생성 (필수)

JWT 인증을 위한 RSA 키 쌍을 생성해야 합니다:

```bash
# 개인키 생성
openssl genrsa -out privateKey.pem 2048

# 공개키 추출
openssl rsa -in privateKey.pem -pubout -out publicKey.pem

# src/main/resources에 공개키 복사
cp publicKey.pem src/main/resources/
```

> **중요**: `privateKey.pem`은 절대 Git에 커밋하지 마세요!

### 3. Frontend/Admin 의존성 설치

```bash
cd frontend && npm install
cd ../admin && npm install
```

## Running (Development)

### Backend

```bash
./gradlew quarkusDev -Dquarkus.http.host=0.0.0.0
```

Backend: http://localhost:8080
Swagger UI: http://localhost:8080/q/swagger-ui

### Frontend

```bash
cd frontend && npm run dev
```

Frontend: http://localhost:3000

### Admin

```bash
cd admin && npm run dev
```

Admin: http://localhost:3001

## Running (Docker)

모든 서비스를 Docker로 실행:

```bash
docker compose up -d --build
```

| Service | Port | URL |
|---------|------|-----|
| Backend | 8080 | http://localhost:8080 |
| Frontend | 3000 | http://localhost:3000 |
| Admin | 3001 | http://localhost:3001 |

### Docker 명령어

```bash
# 전체 빌드 및 실행
docker compose up -d --build

# 개별 서비스 재빌드
docker compose up -d --build backend

# 로그 확인
docker logs bluewings-backend

# 중지
docker compose down
```

## Required Files (Not in Repository)

보안상의 이유로 다음 파일들은 저장소에 포함되지 않습니다. 직접 생성해야 합니다:

| 파일 | 설명 | 생성 방법 |
|------|------|----------|
| `.env` | 환경 변수 | `.env.example` 복사 후 수정 |
| `privateKey.pem` | JWT 서명용 개인키 | OpenSSL로 생성 (위 설명 참조) |

### .env 파일 예시

```env
DB_USERNAME=postgres.xxxx
DB_PASSWORD=your-password
DB_URL=jdbc:postgresql://xxx.pooler.supabase.com:6543/postgres?prepareThreshold=0
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiYjYwMDcw...  # 프로덕션 배포 시 필요
```

### JWT 키 구조

```
project-root/
├── privateKey.pem              # JWT 서명용 (Git 제외)
├── publicKey.pem               # JWT 검증용 (Git 포함)
└── src/main/resources/
    └── publicKey.pem           # 백엔드용 복사본
```

## API Documentation

Backend 실행 후 Swagger UI에서 API 문서 확인:
- http://localhost:8080/q/swagger-ui

## Health Check

```bash
curl http://localhost:8080/q/health
```

## Project Structure

```
bluewings-nest/
├── src/main/kotlin/com/bluewings/   # Backend 소스
├── src/main/resources/
│   ├── application.properties       # 설정
│   └── db/migration/                # Flyway 마이그레이션
├── frontend/                        # Next.js 프론트엔드
├── admin/                           # Next.js 어드민
├── docker-compose.yml               # Docker 설정
├── Dockerfile.backend               # Backend Dockerfile
└── .env.example                     # 환경변수 템플릿
```

## License

This project is for personal/educational use.
