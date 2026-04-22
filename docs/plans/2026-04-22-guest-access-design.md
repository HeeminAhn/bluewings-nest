# 비회원 접근 허용 설계

**작성일**: 2026-04-22
**대상 브랜치**: `refactor/backend-page-params` (또는 신규 브랜치)

## 배경과 목표

현재 홈(`/`)이 비회원을 `/login`으로 리다이렉트하여 미로그인 사용자가 커뮤니티를 체험할 수 없다. 다른 조회 API(게시글/공지/경기)는 이미 `@PermitAll`로 공개되어 있으나 홈 UI와 BottomNav가 이를 반영하지 못한 상태다.

**목표**: 게시글·공지·경기 조회는 공개, 댓글은 회원 전용(내부 대화 정책).

## 정책

| 항목 | 결정 | 근거 |
|---|---|---|
| 게시글/공지/경기 조회 | 공개 | 기존 백엔드 상태 유지 + 프론트 정합 |
| 댓글 조회 | **회원 전용** | "댓글은 내부 대화"라는 커뮤니티 정책 |
| 댓글 개수 노출 | 목록/인기글 공개, **상세에서만 숨김** | "집계는 메타, 내용은 내부"로 분리. 회원 전환 훅 보존 |
| BottomNav MY 탭 | 비회원에겐 **"로그인" 탭**으로 치환 | 회원 전환 동선 시각적으로 명확화 |
| `ChatResource` | `@PermitAll → @Authenticated` | 동반 정리 (프론트 리다이렉트만으로는 서버 보호 부재) |
| `MatchResource` | `@PermitAll` 명시 추가 | 동작 불변, 의도 선언만 (향후 deny-all 정책 대비) |
| `AppShell` stub 복원 | **범위 밖** | 별도 PR |

## 변경 범위

### Backend (3 파일, 1 커밋)

- `src/main/kotlin/com/bluewings/community/resource/CommentResource.kt`
  - `getComments`: `@PermitAll → @Authenticated`, import 교체
- `src/main/kotlin/com/bluewings/chat/resource/ChatResource.kt`
  - 클래스 레벨 `@PermitAll → @Authenticated`
- `src/main/kotlin/com/bluewings/match/resource/MatchResource.kt`
  - 클래스 레벨 `@PermitAll` 신규 추가 (의도 명시)

### Frontend (3 파일, 3 커밋)

- `frontend/src/components/layout/BottomNav.tsx`
  - `isAuthenticated` 기반 네 번째 탭 스왑 (MY ↔ LogIn)
  - hydration 전에는 "MY" 유지로 깜빡임 최소화
- `frontend/src/app/page.tsx`
  - 로그인 리다이렉트 제거
  - 초기 데이터 로드 useEffect를 공개/회원 전용으로 분리
  - 스켈레톤 조건을 `!_hasHydrated`만으로 축소
  - 프로필 카드 자리에 비회원 CTA 카드 대체
  - popularPeriod useEffect에서 `isAuthenticated` 체크 제거
- `frontend/src/app/posts/[id]/PostDetailClient.tsx`
  - `fetchComments`를 `isAuthenticated`일 때만 호출
  - 액션바 `commentCount` 회원 전용 렌더
  - 댓글 카드 영역을 회원/비회원 분기 (비회원: "댓글은 회원만 확인할 수 있어요" + 로그인 CTA)
  - 하단 고정 "로그인하고 댓글을 작성하세요" 바 제거 (내부 CTA와 중복)

### 변경 없음 (이미 적절)

- `PostListClient.tsx`, `NoticesClient.tsx`, `NoticeDetailClient.tsx`: 이미 `showAuthUI` 기반 처리
- `/posts/write`, `/posts/[id]/edit`, `/mypage*`, `/chat`, `/notices/write`, `/notices/[id]/edit`: 이미 `/login` 리다이렉트 처리

## API 동작 변화

| 요청 | Before | After |
|---|---|---|
| `GET /api/posts/{id}/comments` (no token) | 200 | **401** |
| `GET /api/posts/{id}/comments` (USER/ADMIN) | 200 | 200 |
| `GET /api/chat/*` (no token) | 200 | **401** |
| `GET /api/matches*` | 200 | 200 (불변) |
| `GET /api/posts*`, `/api/notices*` | 200 | 200 (불변) |

## 에지 케이스

- **Hydration 플래시**: BottomNav는 hydration 전 "MY" 유지 (보수적). `page.tsx`/`PostDetailClient.tsx`의 `showAuthUI`/`isAuthenticated` 분기는 hydration 이후에만 발생.
- **로그인 직후 전환**: `useEffect` 의존성에 `isAuthenticated` 포함 → 로그인 후 홈 복귀 시 `fetchProfile/fetchGradeInfo` 재실행. 게시글 상세 복귀 시 `fetchComments` 재실행.
- **토큰 만료(401)**: 기존 전역 401 핸들링 동작 유지 (이번 스코프 밖).
- **`initialPost.commentCount`**: 서버 컴포넌트 props로 전달되지만 비회원 렌더링에서 화면 노출 없음 (DTO 스키마는 불변).

## 테스트 시나리오

### Backend (curl)

- `curl http://localhost:8180/api/posts/1/comments` → 401
- 유효 JWT로 동일 요청 → 200
- `curl http://localhost:8180/api/matches` → 200
- `curl http://localhost:8180/api/chat/...` (no token) → 401
- `curl http://localhost:8180/api/posts`, `/api/notices` → 200

### Frontend (브라우저, 비회원 로그아웃 상태)

- [ ] 홈 접속 시 `/login` 리다이렉트 없음
- [ ] 홈의 프로필 카드 자리에 "환영합니다" CTA 카드 표시
- [ ] BottomNav 네 번째 탭이 "로그인"으로 표시
- [ ] 게시글 상세: 본문 정상, 액션바 💬 숨김, 댓글 영역에 회원 CTA
- [ ] 하단 고정 바 제거 확인
- [ ] `/posts`, `/notices`, `/matches` 정상 조회
- [ ] `/posts/write`, `/mypage`, `/chat` → `/login` 리다이렉트

### Frontend (회원 로그인 상태, 회귀 방지)

- [ ] 홈: 프로필/등급 프로그레스/출석 체크 정상
- [ ] 게시글 상세: 댓글 목록/작성/수정/삭제/대댓글 정상
- [ ] BottomNav MY 탭 정상
- [ ] 출석 체크 + 포츈쿠키 모달 정상

## 롤백 전략

커밋 4개(Backend 1 + Frontend 3)가 논리적으로 독립적이므로 단위별 `revert` 가능.

- Backend 커밋만 revert → 서버는 다시 열리지만 UI는 비회원 UX 유지 (화면 레벨은 동일)
- Frontend 커밋 일부만 revert 가능 (홈/상세/BottomNav 각각 독립)

## 범위 밖 (후속 작업)

- `AppShell.tsx` stub 복원
- 전역 401 인터셉터 개선
- 권한 체계 문서(있다면) 갱신
- SEO/robots 조치 (정책이 '내부 대화'이지 'SEO 방지'는 아님)

## 커밋 구조

```
refactor(backend): tighten comment/chat auth, make match public explicit
feat(frontend): allow guest access on home with login CTA card
feat(frontend): hide comments from guests on post detail with login CTA
feat(frontend): swap MY → LogIn tab in BottomNav for guests
```
