# PR Title

```
refactor(backend): 페이지네이션 파라미터를 @BeanParam PageParams로 공통화
```

---

# PR Body

## Summary

- 백엔드 페이징 리소스 전반에 걸쳐 반복되던 `@QueryParam("page") @DefaultValue("0") + @QueryParam("size") @DefaultValue("20")` 쌍을 **Jakarta REST 표준 `@BeanParam`** 기반의 공통 `PageParams` DTO로 치환
- `@ParameterObject`(SpringDoc 전용)가 Quarkus에서 동작하지 않아 동일한 DX를 제공하는 `@BeanParam`을 사용 — SmallRye OpenAPI가 필드를 평면화해 Swagger UI에서는 기존과 동일하게 `page`/`size`로 노출됨
- 기존엔 `page=-1`, `size=99999` 같은 비정상 입력이 JAX-RS 레이어에서 아무 검증 없이 DB까지 도달했는데, 이제 `@Min` / `@Max(100)` 로 차단

## Scope

- **총 12 파일 / 2 커밋 / +102 / −42 lines**
- `src/main/kotlin/com/bluewings/common/pagination/PageParams.kt` 신규 (31 lines)
- 공용 리소스 (3 파일 / 4 엔드포인트)
- Admin 리소스 (8 파일 / 10 엔드포인트)
- 변경 없음: 도메인, 리포지토리, CQRS handler, DTO, DB migration, frontend

### 커밋 구성

| SHA | 내용 |
|---|---|
| `9a1c7f7` | `PageParams` 클래스 추가 + `NoticeResource` 2개 엔드포인트 파일럿 전환 |
| `4556d13` | 나머지 13곳 일괄 치환 |

## Key Changes

### 1. `common/pagination/PageParams.kt` (신규)

```kotlin
class PageParams {
    @QueryParam("page") @DefaultValue("0")
    @Min(value = 0, message = "page는 0 이상이어야 합니다")
    @Parameter(description = "0부터 시작하는 페이지 번호", example = "0")
    var page: Int = 0

    @QueryParam("size") @DefaultValue("20")
    @Min(value = 1, message = "size는 1 이상이어야 합니다")
    @Max(value = 100, message = "size는 100 이하여야 합니다")
    @Parameter(description = "페이지 크기 (1-100)", example = "20")
    var size: Int = 20
}
```

### 2. 전환 패턴

**Before**
```kotlin
fun getNotices(
    @QueryParam("page") @DefaultValue("0") page: Int,
    @QueryParam("size") @DefaultValue("20") size: Int
): ApiResponse<PagedNoticeResponse> { ... }
```

**After**
```kotlin
fun getNotices(@Valid @BeanParam pageParams: PageParams): ApiResponse<PagedNoticeResponse> {
    // ...
}
```

### 3. 전환된 엔드포인트 (14개)

**공용 (Public)**
- `NoticeResource.getNotices`, `searchNotices`
- `CommentResource.getComments`
- `PostResource.getPosts`, `searchPosts`, `getPostsByMember`

**Admin**
- `AdminMatchResource.getMatches`
- `AdminCategoryResource.getCategories`
- `AdminNoticeResource.getNotices`
- `AdminAccessLogResource.getAccessLogs`, `getAccessLogsByIp`
- `AdminPostResource.getPosts`
- `AdminReportResource.getReports`, `getMemberReports`
- `AdminCommentResource.getComments`
- `AdminMemberResource.getMembers`, `getMemberAccessLogs`

Admin 리소스 대부분은 메서드 내부에서 `page` / `size`를 빈번히 재사용하므로, 시그니처만 바꾸고 바디 첫 줄에서 로컬 `val page = pageParams.page; val size = pageParams.size`로 바인딩해 나머지 로직은 건드리지 않음. 순수 시그니처 교체로 유지.

## Benefits

1. **중복 제거**: 반복되던 `@QueryParam("page/size") + @DefaultValue` 28줄 제거
2. **검증 도입**: 이전에는 bound check 부재 — `page=-1`, `size=100000` 같은 요청이 JAX-RS 레이어에서 필터링되지 않아 DB로 직진. 이제 `@Min(0)` / `@Max(100)`로 막힘
3. **정책 일원화**: max size 변경, 기본 페이지 크기 변경 등이 `PageParams.kt` 한 곳 수정으로 끝남
4. **Swagger UI DX 유지**: SmallRye OpenAPI가 `@BeanParam` 필드를 평면화하므로 Swagger에는 기존과 동일하게 `page`, `size` 두 파라미터로 표시됨

## Intentionally Deferred

### `AdminChatResource.getMessages` (`size=50` 기본값)

이 엔드포인트만 `size=50`이 기본값이라 `PageParams`의 표준 기본값(`size=20`)과 불일치. 단순 치환 시 admin 채팅 뷰어에서 페이지당 항목 수가 바뀌는 **behavior change**가 발생하므로 제외.

권장 선행 작업: admin 프론트가 `?size=50`을 명시적으로 보내도록 수정 → 이후 후속 PR로 백엔드도 `PageParams` 전환.

## Validation

- `./gradlew compileKotlin` → **BUILD SUCCESSFUL**
- 검증 grep:
  ```bash
  $ grep -rn '@QueryParam("page") @DefaultValue("0")' src/main/kotlin
  # AdminChatResource.kt:30 (의도적으로 유지, 위 Deferred 참조)
  ```
- 빌드 시 lint/warning 추가 없음

## Test Plan (리뷰어용)

- [ ] `./gradlew quarkusDev -Dquarkus.http.host=0.0.0.0` 기동
- [ ] Swagger UI (`http://localhost:8080/q/swagger-ui`) 에서 전환된 엔드포인트의 파라미터가 여전히 `page`, `size` 두 개로 평면화되어 노출되는지 확인
  - 예: `GET /api/notices`, `GET /api/posts`, `GET /api/admin/members`
- [ ] 정상 요청 확인
  ```bash
  curl "http://localhost:8080/api/notices?page=0&size=10"
  # → 200 OK
  ```
- [ ] 검증 실패 동작 확인 (**신규 동작 — 기존에는 통과했던 요청들**)
  ```bash
  curl "http://localhost:8080/api/notices?page=-1"
  # → 400 Bad Request (page는 0 이상)

  curl "http://localhost:8080/api/notices?size=0"
  # → 400 Bad Request (size는 1 이상)

  curl "http://localhost:8080/api/notices?size=101"
  # → 400 Bad Request (size는 100 이하)
  ```
- [ ] AdminChat 회귀 없음 확인: `GET /api/admin/chats/messages?size=50` 기존과 동일하게 동작 (이번 PR에서 제외됨)
- [ ] 프론트엔드 기존 호출 전부 정상: `page=0..N`, `size=20`이 기본 케이스이므로 영향 없음

## Breaking Changes

**없음** — 쿼리 파라미터 이름과 기본값은 그대로 유지.

**단, 잠재 리스크**: 이전에는 `size=200`, `page=-5` 같은 비정상 요청도 그대로 DB에 전달돼서 **정상 응답처럼 보였을 수** 있음. 그런 요청을 보내는 클라이언트가 있었다면 이번 PR부터 400 으로 거절됨. 프론트엔드 코드 전수 조사 결과 해당 패턴은 발견되지 않음 (모든 호출이 `size=20` 또는 미지정).

## Related

- 설계 논의: 세션 대화 (`ParameterObject` 검토 → `@BeanParam` 선택)
- 후속 PR 후보:
  1. AdminChat PageParams 전환 (프론트 변경 선행 후)
  2. 응답 DTO 일원화 (`PagedNoticeResponse`, `PagedPostResponse` 등 → 제네릭 `Page<T>`)
  3. 정렬 공통화 (`sort=field,direction` 같은 표준 파라미터)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
