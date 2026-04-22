# 비회원 접근 허용 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 비회원이 홈/게시글/공지/경기를 조회할 수 있게 하고, 댓글은 회원 전용(내부 대화)으로 제한한다.

**Architecture:** Backend는 `CommentResource.getComments`/`ChatResource` 인증 어노테이션을 `@Authenticated`로 승격하고 `MatchResource`엔 `@PermitAll`을 명시한다. Frontend는 `page.tsx`의 로그인 리다이렉트를 제거하고 비회원용 CTA 카드로 프로필 영역을 대체하며, `PostDetailClient`의 댓글 영역을 회원/비회원 분기 렌더링으로 바꾸고, `BottomNav`의 MY 탭을 비회원에게 로그인 탭으로 치환한다.

**Tech Stack:** Quarkus (Jakarta Security, SmallRye JWT), Kotlin. Next.js 16 (App Router, React 19), Zustand, Tailwind CSS, shadcn/ui, lucide-react.

**Design reference:** `docs/plans/2026-04-22-guest-access-design.md`

**Ports:** backend `8180`, frontend `3100` (로컬 개발 포트)

---

## Task 1: Backend 인증 어노테이션 교정

**Files:**
- Modify: `src/main/kotlin/com/bluewings/community/resource/CommentResource.kt:10,38-39`
- Modify: `src/main/kotlin/com/bluewings/chat/resource/ChatResource.kt:7,12-15,25-27`
- Modify: `src/main/kotlin/com/bluewings/match/resource/MatchResource.kt:12-17`

### Step 1.1: `CommentResource.kt` 수정

`src/main/kotlin/com/bluewings/community/resource/CommentResource.kt`를 연다.

(a) import 블록에서 `jakarta.annotation.security.PermitAll`을 삭제하고 `io.quarkus.security.Authenticated`를 추가한다. 기존 `import jakarta.annotation.security.RolesAllowed`는 유지(POST/PUT/DELETE에서 사용).

변경 전 (10라인 부근):
```kotlin
import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
```
변경 후:
```kotlin
import io.quarkus.security.Authenticated
import jakarta.annotation.security.RolesAllowed
```

(b) `getComments` 메서드의 어노테이션 교체 (38-39라인):

변경 전:
```kotlin
@GET
@PermitAll
@Operation(summary = "댓글 목록 조회", description = "게시글의 댓글 목록을 조회합니다")
fun getComments(
```
변경 후:
```kotlin
@GET
@Authenticated
@Operation(summary = "댓글 목록 조회", description = "게시글의 댓글 목록을 조회합니다 (회원 전용)")
fun getComments(
```

### Step 1.2: `ChatResource.kt` 수정

`src/main/kotlin/com/bluewings/chat/resource/ChatResource.kt`를 연다.

(a) import 블록에서 `jakarta.annotation.security.PermitAll`을 삭제하고 `io.quarkus.security.Authenticated`를 추가한다.

변경 전 (7라인):
```kotlin
import jakarta.annotation.security.PermitAll
```
변경 후:
```kotlin
import io.quarkus.security.Authenticated
```

(b) 클래스 선언부에 `@Authenticated`를 추가하고, 메서드 레벨의 `@PermitAll`을 제거한다.

변경 전 (12-15라인):
```kotlin
@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class ChatResource {
```
변경 후:
```kotlin
@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
class ChatResource {
```

변경 전 (25-27라인):
```kotlin
    @GET
    @Path("/history")
    @PermitAll
    fun getHistory(
```
변경 후:
```kotlin
    @GET
    @Path("/history")
    fun getHistory(
```

### Step 1.3: `MatchResource.kt` 수정

`src/main/kotlin/com/bluewings/match/resource/MatchResource.kt`를 연다.

(a) import에 `jakarta.annotation.security.PermitAll`을 추가한다.

현재 imports 블록(3-12라인 사이)에 다음 줄을 알파벳 순(jakarta 블록)에 추가:
```kotlin
import jakarta.annotation.security.PermitAll
```

(b) 클래스 선언부에 `@PermitAll` 추가.

변경 전 (14-17라인):
```kotlin
@Path("/api/matches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class MatchResource {
```
변경 후:
```kotlin
@Path("/api/matches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
class MatchResource {
```

### Step 1.4: 컴파일 확인

Run:
```bash
./gradlew compileKotlin --quiet
```
Expected: 에러 없이 종료 (exit 0). 어노테이션 import 누락 시 컴파일 에러 발생.

### Step 1.5: Quarkus Dev 모드 기동

Run (백그라운드):
```bash
./gradlew quarkusDev -Dquarkus.http.host=0.0.0.0
```
Expected: `Listening on: http://0.0.0.0:8180` 로그 확인. 기동 실패 시 로그에서 원인 확인.

### Step 1.6: API 동작 수동 검증

Run (토큰 없이):
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8180/api/posts/1/comments
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8180/api/chat/history
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8180/api/matches
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8180/api/posts
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8180/api/notices
```
Expected output (순서대로):
```
401
401
200
200
200
```

(게시글 id=1이 없으면 `/api/posts/1/comments`는 404일 수 있음. 이 경우 실제 존재하는 게시글 ID로 교체하거나, 401 vs 404 구분을 위해 `curl -v` 사용해 `WWW-Authenticate` 헤더 유무로 인증 실패 여부 확인.)

유효 JWT로 재검증 (선택):
```bash
# 유효한 토큰이 있다면
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:8180/api/posts/1/comments
```
Expected: 200 응답.

### Step 1.7: Quarkus Dev 중단 후 커밋

```bash
git add src/main/kotlin/com/bluewings/community/resource/CommentResource.kt \
        src/main/kotlin/com/bluewings/chat/resource/ChatResource.kt \
        src/main/kotlin/com/bluewings/match/resource/MatchResource.kt
git commit -m "refactor(backend): tighten comment/chat auth, make match public explicit

- CommentResource.getComments: @PermitAll → @Authenticated (댓글은 회원 전용)
- ChatResource: 클래스 레벨 @Authenticated (메서드 @PermitAll 제거)
- MatchResource: @PermitAll 명시 (의도 선언, 동작 불변)"
```

---

## Task 2: Frontend - BottomNav MY ↔ 로그인 탭 치환

**Files:**
- Modify: `frontend/src/components/layout/BottomNav.tsx`

### Step 2.1: `BottomNav.tsx` 수정

파일을 열고 다음으로 **전체 교체**한다 (기존 구조 유지, `isAuthenticated` 분기만 추가):

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, MessageSquare, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

// BottomNav를 숨길 페이지 경로
const hiddenPaths = ['/login', '/signup', '/chat'];

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // 특정 페이지에서는 숨김
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));
  if (shouldHide) return null;

  // hydration 전에는 MY 유지 (깜빡임 회피). hydration 후 guest면 LogIn으로 스왑
  const isGuest = _hasHydrated && !isAuthenticated;

  const navItems = [
    { id: 'home', icon: Home, label: '홈', path: '/' },
    { id: 'schedule', icon: Calendar, label: '경기', path: '/matches' },
    { id: 'community', icon: MessageSquare, label: '커뮤니티', path: '/posts' },
    isGuest
      ? { id: 'login', icon: LogIn, label: '로그인', path: '/login' }
      : { id: 'mypage', icon: User, label: 'MY', path: '/mypage' },
  ];

  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/matches')) return 'schedule';
    if (pathname.startsWith('/posts') || pathname.startsWith('/notices')) return 'community';
    if (pathname.startsWith('/mypage')) return 'mypage';
    if (pathname.startsWith('/login')) return 'login';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-2 py-1 z-50 md:hidden", className)}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
              activeTab === item.id ? 'text-blue-700' : 'text-slate-400'
            }`}
          >
            <item.icon
              size={22}
              className={activeTab === item.id ? 'fill-blue-700/20' : ''}
            />
            <span className={`text-xs ${activeTab === item.id ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
```

### Step 2.2: 린트·타입 체크

Run:
```bash
cd frontend && npx tsc --noEmit --project tsconfig.json
```
Expected: 에러 없이 종료.

```bash
cd frontend && npx eslint src/components/layout/BottomNav.tsx
```
Expected: 에러 없음.

### Step 2.3: 커밋

```bash
git add frontend/src/components/layout/BottomNav.tsx
git commit -m "feat(frontend): swap MY → LogIn tab in BottomNav for guests"
```

---

## Task 3: Frontend - 홈 비회원 접근

**Files:**
- Modify: `frontend/src/app/page.tsx:62-88` (초기 데이터 로드 useEffect)
- Modify: `frontend/src/app/page.tsx:90-100` (popularPeriod useEffect)
- Modify: `frontend/src/app/page.tsx:135` (스켈레톤 조건)
- Modify: `frontend/src/app/page.tsx:311-370` (프로필 카드 → 분기 렌더링)

### Step 3.1: 초기 데이터 로드 useEffect 수정

62-88라인의 `useEffect` 블록 전체를 다음으로 교체:

```tsx
useEffect(() => {
  if (!_hasHydrated) return;

  // 모두에게 공개되는 데이터
  const loadPublicData = () => Promise.all([
    api.getPopularPosts(popularPeriod, 5).then((res) => {
      if (res.success && res.data) setPopularPosts(res.data);
    }),
    api.getNotices(0, 5).then((res) => {
      if (res.success && res.data) setNotices(res.data.notices);
    }),
    api.getUpcomingMatches().then((res) => {
      if (res.success && res.data && res.data.upcoming && res.data.upcoming.length > 0) {
        setNextMatch(res.data.upcoming[0]);
      }
    }),
  ]);

  loadPublicData();

  // 회원 전용 데이터
  if (isAuthenticated) {
    fetchProfile();
    fetchGradeInfo();
  }
}, [_hasHydrated, isAuthenticated, fetchProfile, fetchGradeInfo]);
```

**주의**: 의존성 배열에서 `router`와 `popularPeriod`를 제외 (popularPeriod는 아래 별도 useEffect에서 처리. router는 더 이상 사용 안 함).

### Step 3.2: popularPeriod useEffect 수정

90-100라인(기존 useEffect)에서 인증 체크 제거:

변경 전:
```tsx
useEffect(() => {
  if (!_hasHydrated || !isAuthenticated) return;
  ...
```
변경 후:
```tsx
useEffect(() => {
  if (!_hasHydrated) return;
  ...
```

### Step 3.3: 스켈레톤 조건 완화

135라인:

변경 전:
```tsx
if (!_hasHydrated || !member || !member.nickname) {
```
변경 후:
```tsx
if (!_hasHydrated) {
```

### Step 3.4: 프로필 카드 자리 분기 렌더링

311-370라인의 `{/* 프로필 카드 */}` 블록(`<Card className="shadow-lg border-0 lg:col-span-1">`부터 해당 `</Card>`까지)을 다음으로 교체:

```tsx
{/* 프로필 카드 — 회원만 */}
{isAuthenticated && member && (
  <Card className="shadow-lg border-0 lg:col-span-1">
    <CardContent className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-14 h-14 border-2 border-blue-100">
          {member.profileImageUrl ? (
            <AvatarImage src={api.getImageUrl(member.profileImageUrl)} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-2xl">
            {gradeEmoji[member.grade?.currentGrade?.name || 'ROOKIE']}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-slate-800">{member.nickname}</h2>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              {member.grade?.currentGrade?.displayName || '신입 서포터'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{totalPoints.toLocaleString()}P</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-slate-400"
        >
          <LogOut size={20} />
        </Button>
      </div>

      {/* 등급 프로그레스 */}
      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">다음 등급까지</span>
          <span className="font-bold text-blue-700">
            {(nextGradePoints - totalPoints).toLocaleString()}P
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-xs mt-2 text-slate-400">
          <span>{member.grade?.currentGrade?.name || 'ROOKIE'}</span>
          <span>{member.grade?.nextGrade?.name || 'SUPPORTER'}</span>
        </div>
      </div>

      {/* 출석 체크 버튼 */}
      <Button
        onClick={handleAttendance}
        disabled={isLoading || alreadyAttended}
        className={`w-full ${
          alreadyAttended
            ? 'bg-slate-100 text-slate-400 hover:bg-slate-100'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
      >
        <CalendarCheck className="w-5 h-5 mr-2" />
        {isLoading ? '처리중...' : alreadyAttended ? '오늘 출석 완료!' : '출석 체크 +5P'}
      </Button>
    </CardContent>
  </Card>
)}

{/* 비회원 대체 — 로그인/회원가입 CTA 카드 */}
{_hasHydrated && !isAuthenticated && (
  <Card className="shadow-lg border-0 lg:col-span-1">
    <CardContent className="p-6 text-center">
      <h2 className="font-bold text-lg text-slate-800 mb-1">환영합니다</h2>
      <p className="text-sm text-slate-500 mb-4">로그인하고 모든 기능을 이용하세요</p>
      <div className="flex gap-2">
        <Button asChild className="flex-1 bg-blue-700 hover:bg-blue-800">
          <Link href="/login">로그인</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/signup">회원가입</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

**주의**: 렌더 본문 앞쪽에 `const activityStats = ...`, `const alreadyAttended = ...`, `const totalPoints = ...`, `const nextGradePoints = ...`, `const progressPercent = ...`, `const gradeEmoji = ...` 등이 정의되어 있으므로(158-171라인), 이들은 `member`가 없을 때도 접근 가능하도록 **옵셔널 체이닝으로 보호**되어야 한다.

현재 코드:
```tsx
const activityStats = member.grade?.activityStats;
const alreadyAttended = activityStats?.lastAttendanceDate === today;
const totalPoints = member.grade?.currentPoints || 0;
const nextGradePoints = member.grade?.nextGrade?.requiredPoints || 100;
const progressPercent = Math.min((totalPoints / nextGradePoints) * 100, 100);
```

변경:
```tsx
const activityStats = member?.grade?.activityStats;
const alreadyAttended = activityStats?.lastAttendanceDate === today;
const totalPoints = member?.grade?.currentPoints || 0;
const nextGradePoints = member?.grade?.nextGrade?.requiredPoints || 100;
const progressPercent = Math.min((totalPoints / nextGradePoints) * 100, 100);
```

### Step 3.5: 타입 체크 & 린트

```bash
cd frontend && npx tsc --noEmit --project tsconfig.json
```
Expected: 에러 없음.

```bash
cd frontend && npx eslint src/app/page.tsx
```
Expected: 에러 없음.

### Step 3.6: 개발 서버 기동 및 수동 검증

Run (백그라운드):
```bash
cd frontend && npm run dev
```
Expected: `- Local: http://localhost:3100` 로그.

브라우저 체크 (비로그인 상태):
- `http://localhost:3100/` 접속 → `/login`으로 리다이렉트 **없음**
- 히어로 헤더(다음 경기 카드)와 인기글/공지 배너가 정상 렌더
- 프로필 카드 자리에 "환영합니다 / 로그인 / 회원가입" CTA 카드
- 스켈레톤 플래시 없이 즉시 콘텐츠 표시 (hydration 직후)

브라우저 체크 (로그인 상태, 회귀 방지):
- 홈에 프로필/등급 프로그레스/출석 체크 정상 표시
- 출석 체크 버튼 동작, 포츈쿠키 모달 정상

### Step 3.7: 커밋

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(frontend): allow guest access on home with login CTA card"
```

---

## Task 4: Frontend - 게시글 상세 댓글 영역 비회원 처리

**Files:**
- Modify: `frontend/src/app/posts/[id]/PostDetailClient.tsx:63-65` (fetchComments 가드)
- Modify: `frontend/src/app/posts/[id]/PostDetailClient.tsx:364-367` (액션바 commentCount)
- Modify: `frontend/src/app/posts/[id]/PostDetailClient.tsx:372-392` (댓글 카드 분기)
- Modify: `frontend/src/app/posts/[id]/PostDetailClient.tsx:456-462` (하단 고정 바 제거)

### Step 4.1: `fetchComments` 가드 추가

63-65라인:

변경 전:
```tsx
useEffect(() => {
  fetchComments();
}, [postId]);
```
변경 후:
```tsx
useEffect(() => {
  if (_hasHydrated && isAuthenticated) {
    fetchComments();
  }
}, [postId, _hasHydrated, isAuthenticated]);
```

### Step 4.2: 액션바 `commentCount` 회원 전용

364-367라인 블록을 `showAuthUI`로 감싸기:

변경 전:
```tsx
<div className="flex items-center gap-1 text-slate-500">
  <MessageCircle className="w-4 h-4" />
  <span className="text-sm">{post.commentCount}</span>
</div>
```
변경 후:
```tsx
{showAuthUI && (
  <div className="flex items-center gap-1 text-slate-500">
    <MessageCircle className="w-4 h-4" />
    <span className="text-sm">{post.commentCount}</span>
  </div>
)}
```

### Step 4.3: 댓글 카드 영역 분기 렌더링

372-392라인의 `<Card className="shadow-sm border-0 rounded-none mt-2">` 블록 전체를 다음으로 교체:

```tsx
<Card className="shadow-sm border-0 rounded-none mt-2">
  <CardContent className="p-4">
    {showAuthUI ? (
      <>
        <h2 className="font-semibold mb-4">댓글 {comments.length}</h2>

        <div className="divide-y divide-slate-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleCommentEdit}
              onDelete={handleCommentDelete}
              onReply={handleReply}
            />
          ))}
        </div>

        {comments.length === 0 && (
          <p className="text-center py-8 text-slate-400">아직 댓글이 없습니다.</p>
        )}
      </>
    ) : (
      <div className="text-center py-8">
        <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm mb-3">
          댓글은 회원만 확인할 수 있어요
        </p>
        <Link href="/login" className="text-blue-700 font-medium text-sm hover:underline">
          로그인하고 대화에 참여하기 →
        </Link>
      </div>
    )}
  </CardContent>
</Card>
```

### Step 4.4: 하단 고정 "로그인하고 댓글을 작성하세요" 제거

456-462라인 블록 전체를 삭제:

삭제 대상:
```tsx
{!showAuthUI && (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 text-center z-40">
    <Link href="/login" className="text-blue-700 font-medium">
      로그인하고 댓글을 작성하세요
    </Link>
  </div>
)}
```

(회원용 하단 고정 입력 폼 `{showAuthUI && <form ...>}` 블록은 그대로 유지.)

### Step 4.5: 타입 체크 & 린트

```bash
cd frontend && npx tsc --noEmit --project tsconfig.json
```
Expected: 에러 없음.

```bash
cd frontend && npx eslint "src/app/posts/[id]/PostDetailClient.tsx"
```
Expected: 에러 없음.

### Step 4.6: 수동 검증

개발 서버가 이미 실행 중이면 hot reload 후 브라우저 새로고침.

비로그인 상태:
- 게시글 상세(`http://localhost:3100/posts/<id>`) 접속 → 본문 정상 표시
- 액션바에 좋아요는 보이나 💬 댓글 수 **미표시**
- 댓글 카드 영역에 "댓글은 회원만 확인할 수 있어요" + "로그인하고 대화에 참여하기" 링크
- 하단에 고정 바 없음 (이전 "로그인하고 댓글을 작성하세요" 영역)
- 개발자 도구 Network 탭에서 `/api/posts/<id>/comments` 호출이 **발생하지 않음** 확인

로그인 상태 (회귀 방지):
- 댓글 목록 정상 표시 (개수 일치)
- 액션바에 💬 `commentCount` 표시
- 하단 고정 입력 폼에서 댓글 작성/수정/삭제/대댓글 정상

### Step 4.7: 커밋

```bash
git add "frontend/src/app/posts/[id]/PostDetailClient.tsx"
git commit -m "feat(frontend): hide comments from guests on post detail with login CTA"
```

---

## Task 5: 통합 검증

**Files:** (변경 없음, 검증만)

### Step 5.1: 전체 빌드

```bash
cd frontend && npm run build
```
Expected: 에러 없이 완료. 경고는 허용(기존과 동일 수준).

```bash
./gradlew build -x test
```
Expected: `BUILD SUCCESSFUL`.

### Step 5.2: 비회원 End-to-End 시나리오

로그아웃 상태로 브라우저에서 순서대로 확인:

- [ ] `http://localhost:3100/` → 리다이렉트 없음, 비회원 CTA 카드 표시
- [ ] 히어로 헤더의 다음 경기 카드 표시 (경기 데이터가 있을 때)
- [ ] 인기글/공지 배너 정상 표시
- [ ] BottomNav 네 번째 탭이 "로그인" (LogIn 아이콘)
- [ ] BottomNav "홈", "경기", "커뮤니티" 각 탭 이동 정상
- [ ] `http://localhost:3100/posts` → 목록 정상. 글쓰기 버튼 없음. 카드에 `commentCount` 표시됨 (목록은 유지)
- [ ] `http://localhost:3100/posts/<id>` → 본문 정상, 댓글 영역에 로그인 CTA, 액션바 댓글 수 숨김
- [ ] `http://localhost:3100/notices` → 정상 조회
- [ ] `http://localhost:3100/matches` → 정상 조회
- [ ] `http://localhost:3100/posts/write` → `/login`으로 리다이렉트
- [ ] `http://localhost:3100/mypage` → `/login`으로 리다이렉트
- [ ] `http://localhost:3100/chat` → `/login`으로 리다이렉트

### Step 5.3: 회원 End-to-End 시나리오 (회귀 방지)

로그인 후 순서대로:

- [ ] 홈에 프로필/등급 프로그레스/출석 체크 정상
- [ ] 출석 체크 +5P 동작 (포츈쿠키 모달 포함)
- [ ] BottomNav "MY" 탭 정상 (User 아이콘), `/mypage` 이동
- [ ] 게시글 상세: 댓글 목록 로드, 댓글 작성/수정/삭제, 대댓글 정상
- [ ] 게시글 상세: 액션바에 💬 댓글 수 표시
- [ ] 채팅 페이지 진입 정상

### Step 5.4: Backend 인증 경계 재확인

Quarkus dev 기동 중인 상태에서:

```bash
curl -s -o /dev/null -w "comments: %{http_code}\n" http://localhost:8180/api/posts/1/comments
curl -s -o /dev/null -w "chat:     %{http_code}\n" http://localhost:8180/api/chat/history
curl -s -o /dev/null -w "matches:  %{http_code}\n" http://localhost:8180/api/matches
curl -s -o /dev/null -w "posts:    %{http_code}\n" http://localhost:8180/api/posts
curl -s -o /dev/null -w "notices:  %{http_code}\n" http://localhost:8180/api/notices
```
Expected output:
```
comments: 401
chat:     401
matches:  200
posts:    200
notices:  200
```

### Step 5.5: 최종 점검 (추가 커밋 없음)

- 변경된 파일 목록이 계획 범위와 일치하는지 `git log --oneline -5`로 확인
- `git status` clean 확인

```bash
git log --oneline -5
git status
```

---

## 롤백 가이드

| 문제 | 조치 |
|---|---|
| 서버에서 댓글 API 오류 | Task 1 커밋만 `git revert` — Frontend는 이미 guest에게 댓글 숨김 처리되어 화면 영향 없음 |
| 홈 레이아웃 이상 | Task 3 커밋만 `git revert` |
| 게시글 상세 UX 문제 | Task 4 커밋만 `git revert` |
| BottomNav 렌더링 문제 | Task 2 커밋만 `git revert` |

## 범위 밖 (후속 PR)

- `AppShell.tsx` stub 복원 — 별도 PR
- 전역 401 인터셉터 개선
- 권한 체계 문서 갱신(있다면)
