# 백엔드 CQRS 레이어/DTO 구조 통일 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** member/community/notice 모듈에 이미 적용된 CQRS(`cqrs/` 폴더 + `XxxCommands`/`XxxCommandHandler`/`XxxQueries`/`XxxQueryHandler`) 패턴을 match/chat/report 모듈에도 동일하게 적용하고, DTO를 `dto/request`·`dto/response` 하위 폴더로 통일해서 6개 백엔드 모듈의 레이어링 방식을 하나로 맞춘다.

**Architecture:** 각 모듈은 `resource/` (REST/WebSocket 진입점, 얇게 유지) → `cqrs/` (Command/Query 객체 + Handler, `@ApplicationScoped` + 생성자 주입) → `repository/` (Panache) 순서로만 의존한다. Resource 계층은 Repository를 직접 주입하지 않는다. 이번 범위는 오직 **레이어 패턴 통일**과 **DTO 구조 통일**이며, 모듈 간 Repository 직접 참조(JPA `@ManyToOne` 연관관계로 인해 발생하는 것)와 admin 모듈의 cross-module Repository 사용은 의도적으로 범위에서 제외한다 (Task 5에서 CLAUDE.md에 그 이유를 기록한다).

**Tech Stack:** Quarkus (Kotlin), Panache/Hibernate ORM, JAX-RS, Quarkus WebSockets Next, `@QuarkusTest` + REST-assured(사용하지 않음, 이번엔 handler 직접 주입 테스트) + H2 (`%test` 프로파일, `drop-and-create`).

## Global Constraints

- 기존 공개 API 계약(엔드포인트 경로, 요청/응답 JSON 필드, 상태 코드, WebSocket 브로드캐스트 메시지 포맷)은 변경하지 않는다 — 순수 내부 리팩터링이다.
- 새 패키지 이름은 `com.bluewings.<module>.cqrs` 로 통일한다 (community/notice와 동일).
- Command/Query 데이터 클래스에는 `jakarta.validation` 애노테이션을 넣지 않는다 — 검증은 `dto/request`의 REST 요청 DTO에서만 한다 (PostRequests.kt 패턴).
- 각 Handler는 생성자 주입(`class XxxHandler(private val repo: XxxRepository)`)을 쓴다 — `@Inject lateinit var` 필드 주입은 새 코드에 쓰지 않는다.
- 각 태스크 완료 후 `./gradlew compileKotlin compileTestKotlin`으로 컴파일 확인, 이어서 해당 태스크의 테스트를 `./gradlew test --tests "..."`로 실행한다.
- DB는 테스트 시 H2 in-memory(`drop-and-create`)를 쓰므로, 테스트는 자체적으로 필요한 fixture(Member 등)를 직접 persist해서 사용한다. 다른 테스트의 데이터와 충돌하지 않도록 이메일/닉네임 등 unique 값은 각 테스트 메서드마다 다른 값을 쓴다.
- **DB를 건드리는 테스트 메서드에는 반드시 `@TestTransaction`(`io.quarkus.test.TestTransaction`)을 붙인다. `jakarta.transaction.Transactional`을 테스트 메서드에 쓰지 않는다.** 이유: 핸들러들이 `@Transactional`이고 `BusinessException`은 `RuntimeException`이라, `@Transactional` 테스트 안에서 `assertThrows`로 예외를 잡으면 JTA 트랜잭션이 rollback-only로 마킹된 뒤 테스트 종료 시 커밋이 시도되어 `RollbackException`으로 엉뚱하게 실패한다. `@TestTransaction`은 항상 롤백하므로 이 문제가 없고, 테스트 간 데이터 누수도 막아준다.

---

## 파일 구조 개요

| 모듈 | 삭제 | 생성 | 수정 |
|---|---|---|---|
| member | `member/command/`, `member/query/` (2개 폴더) | `member/cqrs/MemberCommands.kt`, `MemberCommandHandler.kt`, `MemberQueries.kt`, `MemberQueryHandler.kt` | `member/service/MemberService.kt`, `member/internal/MemberApiImpl.kt` (import만) |
| match | `match/service/MatchService.kt` | `match/cqrs/MatchQueries.kt`, `MatchQueryHandler.kt` | `match/resource/MatchResource.kt` |
| report | `report/service/ReportService.kt`, `report/dto/ReportRequest.kt` | `report/cqrs/ReportCommands.kt`, `ReportCommandHandler.kt`, `report/dto/request/CreateReportRequest.kt` | `report/resource/ReportResource.kt`, `report/internal/ReportApiImpl.kt` |
| chat | — | `chat/cqrs/ChatCommands.kt`, `ChatCommandHandler.kt`, `ChatQueries.kt`, `ChatQueryHandler.kt`, `chat/dto/request/ChatMessageRequest.kt`, `chat/dto/response/ChatResponses.kt` | `chat/resource/ChatResource.kt`, `chat/resource/ChatWebSocket.kt` |
| — | — | — | `CLAUDE.md` (문서화) |

각 모듈의 `dto/ChatDtos.kt` 등 옛 단일 파일은 request/response로 나눈 뒤 삭제한다.

---

### Task 1: Member 모듈 — `command/`+`query/` → `cqrs/` 병합

**Files:**
- Delete: `src/main/kotlin/com/bluewings/member/command/MemberCommandHandler.kt`, `MemberCommands.kt`
- Delete: `src/main/kotlin/com/bluewings/member/query/MemberQueries.kt`, `MemberQueryHandler.kt`
- Create: `src/main/kotlin/com/bluewings/member/cqrs/MemberCommands.kt`
- Create: `src/main/kotlin/com/bluewings/member/cqrs/MemberCommandHandler.kt`
- Create: `src/main/kotlin/com/bluewings/member/cqrs/MemberQueries.kt`
- Create: `src/main/kotlin/com/bluewings/member/cqrs/MemberQueryHandler.kt`
- Modify: `src/main/kotlin/com/bluewings/member/service/MemberService.kt` (import 변경만)
- Modify: `src/main/kotlin/com/bluewings/member/internal/MemberApiImpl.kt` (import 변경만)
- Test: `src/test/kotlin/com/bluewings/member/cqrs/MemberCqrsHandlerTest.kt`

**Interfaces:**
- Produces: `com.bluewings.member.cqrs.MemberCommandHandler`, `com.bluewings.member.cqrs.MemberQueryHandler` — 이후 태스크 없음(member는 이번 계획에서 여기서 끝). `member.service.MemberService`, `member.internal.MemberApiImpl`는 계속 이 두 클래스를 그대로 사용한다.

이 태스크는 순수 이동(패키지 선언만 변경)이라 로직은 한 글자도 바뀌지 않는다. 외부에서 `com.bluewings.member.command.*` / `com.bluewings.member.query.*`를 참조하는 곳은 `member/service/MemberService.kt`와 `member/internal/MemberApiImpl.kt` 두 곳뿐임을 이미 확인했다 (grep 완료).

- [ ] **Step 1: 4개 파일을 `cqrs/`로 이동하고 패키지 선언 변경**

```bash
mkdir -p src/main/kotlin/com/bluewings/member/cqrs
git mv src/main/kotlin/com/bluewings/member/command/MemberCommandHandler.kt src/main/kotlin/com/bluewings/member/cqrs/MemberCommandHandler.kt
git mv src/main/kotlin/com/bluewings/member/command/MemberCommands.kt src/main/kotlin/com/bluewings/member/cqrs/MemberCommands.kt
git mv src/main/kotlin/com/bluewings/member/query/MemberQueries.kt src/main/kotlin/com/bluewings/member/cqrs/MemberQueries.kt
git mv src/main/kotlin/com/bluewings/member/query/MemberQueryHandler.kt src/main/kotlin/com/bluewings/member/cqrs/MemberQueryHandler.kt
```

그다음 이동한 4개 파일 맨 위 `package com.bluewings.member.command` / `package com.bluewings.member.query` 줄을 전부 `package com.bluewings.member.cqrs`로 바꾼다 (각 파일 1곳씩, Edit 도구로 처리).

- [ ] **Step 2: 이제 비어있는 `command/`, `query/` 폴더 제거**

```bash
rmdir src/main/kotlin/com/bluewings/member/command src/main/kotlin/com/bluewings/member/query
```

- [ ] **Step 3: `MemberService.kt`, `MemberApiImpl.kt`의 import 갱신**

`src/main/kotlin/com/bluewings/member/service/MemberService.kt`에서:
```kotlin
import com.bluewings.member.command.*
```
```kotlin
import com.bluewings.member.query.*
```
두 줄을 하나로 합친다:
```kotlin
import com.bluewings.member.cqrs.*
```

`src/main/kotlin/com/bluewings/member/internal/MemberApiImpl.kt`에서:
```kotlin
import com.bluewings.member.command.ActivityType
import com.bluewings.member.command.DecrementActivityCommand
import com.bluewings.member.command.IncrementActivityCommand
import com.bluewings.member.command.MemberCommandHandler
```
를
```kotlin
import com.bluewings.member.cqrs.ActivityType
import com.bluewings.member.cqrs.DecrementActivityCommand
import com.bluewings.member.cqrs.IncrementActivityCommand
import com.bluewings.member.cqrs.MemberCommandHandler
```
로 바꾼다.

- [ ] **Step 4: 컴파일 확인**

Run: `./gradlew compileKotlin`
Expected: BUILD SUCCESSFUL (import 오류 없음)

- [ ] **Step 5: 이동이 안전했는지 확인하는 회귀 테스트 작성**

```kotlin
package com.bluewings.member.cqrs

import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

@QuarkusTest
class MemberCqrsHandlerTest {

    @Inject
    lateinit var commandHandler: MemberCommandHandler

    @Inject
    lateinit var queryHandler: MemberQueryHandler

    @Test
    @TestTransaction
    fun `signUp 커맨드로 가입하면 QueryHandler로 동일한 회원을 조회할 수 있다`() {
        val memberId = commandHandler.handle(
            SignUpCommand(
                email = "cqrs-move-test@bluewings.com",
                password = "password123!",
                nickname = "cqrs이동테스트"
            )
        )

        val member = queryHandler.handle(GetMemberByIdQuery(memberId))

        assertEquals("cqrs이동테스트", member.nickname)
        assertTrue(queryHandler.handle(CheckEmailAvailableQuery("cqrs-move-test@bluewings.com")).not())
    }
}
```

- [ ] **Step 6: 테스트 실행**

Run: `./gradlew test --tests "com.bluewings.member.cqrs.MemberCqrsHandlerTest"`
Expected: PASS (1 test)

- [ ] **Step 7: 커밋**

```bash
git add src/main/kotlin/com/bluewings/member src/test/kotlin/com/bluewings/member
git commit -m "refactor(member): command/query 폴더를 cqrs/로 통합"
```

---

### Task 2: Match 모듈 — Service → CQRS 전환

match는 전부 읽기 전용(GET)이라 Command는 없다. `MatchService`의 5개 메서드를 그대로 `MatchQueryHandler`의 `handle(query)` 오버로드로 옮긴다.

**Files:**
- Delete: `src/main/kotlin/com/bluewings/match/service/MatchService.kt`
- Create: `src/main/kotlin/com/bluewings/match/cqrs/MatchQueries.kt`
- Create: `src/main/kotlin/com/bluewings/match/cqrs/MatchQueryHandler.kt`
- Modify: `src/main/kotlin/com/bluewings/match/resource/MatchResource.kt`
- Test: `src/test/kotlin/com/bluewings/match/cqrs/MatchQueryHandlerTest.kt`

**Interfaces:**
- Produces: `MatchQueryHandler.handle(GetMatchesBySeasonQuery): MatchListResponse`, `handle(GetMatchesByMonthQuery): MatchListResponse`, `handle(GetUpcomingMatchesQuery): UpcomingMatchesResponse`, `handle(GetMatchByIdQuery): MatchResponse?`, `handle(GetStandingsQuery): StandingsResponse`
- Consumes (기존, 변경 없음): `MatchRepository.findBySeasonOrderByMatchDate/findByYearMonth/findUpcoming/findRecent/findById`, `LeagueStandingRepository.findBySeasonOrderByPosition`, `MatchResponse.from(Match)`, `LeagueStandingResponse.from(LeagueStanding)`

- [ ] **Step 1: `match/cqrs/MatchQueries.kt` 작성**

```kotlin
package com.bluewings.match.cqrs

data class GetMatchesBySeasonQuery(val season: String)

data class GetMatchesByMonthQuery(val year: Int, val month: Int)

data class GetUpcomingMatchesQuery(val limit: Int = 5)

data class GetMatchByIdQuery(val matchId: Long)

data class GetStandingsQuery(val season: String? = null)
```

- [ ] **Step 2: `match/cqrs/MatchQueryHandler.kt` 작성 (MatchService 로직 그대로 이관)**

```kotlin
package com.bluewings.match.cqrs

import com.bluewings.match.dto.response.LeagueStandingResponse
import com.bluewings.match.dto.response.MatchListResponse
import com.bluewings.match.dto.response.MatchResponse
import com.bluewings.match.dto.response.StandingsResponse
import com.bluewings.match.dto.response.UpcomingMatchesResponse
import com.bluewings.match.repository.LeagueStandingRepository
import com.bluewings.match.repository.MatchRepository
import jakarta.enterprise.context.ApplicationScoped
import java.time.Year

@ApplicationScoped
class MatchQueryHandler(
    private val matchRepository: MatchRepository,
    private val standingRepository: LeagueStandingRepository
) {
    fun handle(query: GetMatchesBySeasonQuery): MatchListResponse {
        val matches = matchRepository.findBySeasonOrderByMatchDate(query.season)
        return MatchListResponse(
            matches = matches.map { MatchResponse.from(it) },
            season = query.season
        )
    }

    fun handle(query: GetMatchesByMonthQuery): MatchListResponse {
        val matches = matchRepository.findByYearMonth(query.year, query.month)
        return MatchListResponse(
            matches = matches.map { MatchResponse.from(it) },
            season = query.year.toString()
        )
    }

    fun handle(query: GetUpcomingMatchesQuery): UpcomingMatchesResponse {
        val upcoming = matchRepository.findUpcoming(query.limit)
        val recent = matchRepository.findRecent(query.limit)
        return UpcomingMatchesResponse(
            upcoming = upcoming.map { MatchResponse.from(it) },
            recent = recent.map { MatchResponse.from(it) }
        )
    }

    fun handle(query: GetMatchByIdQuery): MatchResponse? {
        return matchRepository.findById(query.matchId)?.let { MatchResponse.from(it) }
    }

    fun handle(query: GetStandingsQuery): StandingsResponse {
        val targetSeason = query.season ?: Year.now().value.toString()
        val standings = standingRepository.findBySeasonOrderByPosition(targetSeason)
        val suwonStanding = standings.find { it.isSuwon }

        return StandingsResponse(
            season = targetSeason,
            standings = standings.map { LeagueStandingResponse.from(it) },
            suwonPosition = suwonStanding?.position
        )
    }
}
```

- [ ] **Step 3: `MatchService.kt` 삭제**

```bash
git rm src/main/kotlin/com/bluewings/match/service/MatchService.kt
rmdir src/main/kotlin/com/bluewings/match/service 2>/dev/null || true
```

- [ ] **Step 4: `MatchResource.kt`를 `MatchQueryHandler` 기반으로 재작성**

```kotlin
package com.bluewings.match.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.match.cqrs.GetMatchByIdQuery
import com.bluewings.match.cqrs.GetMatchesByMonthQuery
import com.bluewings.match.cqrs.GetMatchesBySeasonQuery
import com.bluewings.match.cqrs.GetStandingsQuery
import com.bluewings.match.cqrs.GetUpcomingMatchesQuery
import com.bluewings.match.cqrs.MatchQueryHandler
import com.bluewings.match.dto.response.MatchListResponse
import com.bluewings.match.dto.response.MatchResponse
import com.bluewings.match.dto.response.StandingsResponse
import com.bluewings.match.dto.response.UpcomingMatchesResponse
import jakarta.annotation.security.PermitAll
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import java.time.Year

@Path("/api/matches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
class MatchResource(
    private val queryHandler: MatchQueryHandler
) {

    @GET
    fun getMatches(
        @QueryParam("season") season: String?,
        @QueryParam("year") year: Int?,
        @QueryParam("month") month: Int?
    ): ApiResponse<MatchListResponse> {
        val response = if (year != null && month != null) {
            queryHandler.handle(GetMatchesByMonthQuery(year, month))
        } else {
            val targetSeason = season ?: Year.now().value.toString()
            queryHandler.handle(GetMatchesBySeasonQuery(targetSeason))
        }
        return ApiResponse.success(response)
    }

    @GET
    @Path("/upcoming")
    fun getUpcomingMatches(): ApiResponse<UpcomingMatchesResponse> {
        val response = queryHandler.handle(GetUpcomingMatchesQuery())
        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    fun getMatch(@PathParam("id") id: Long): ApiResponse<MatchResponse> {
        val match = queryHandler.handle(GetMatchByIdQuery(id))
            ?: throw NotFoundException("경기를 찾을 수 없습니다.")
        return ApiResponse.success(match)
    }

    @GET
    @Path("/standings")
    fun getStandings(@QueryParam("season") season: String?): ApiResponse<StandingsResponse> {
        val response = queryHandler.handle(GetStandingsQuery(season))
        return ApiResponse.success(response)
    }
}
```

- [ ] **Step 5: 컴파일 확인**

Run: `./gradlew compileKotlin`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: `MatchQueryHandler` 테스트 작성**

```kotlin
package com.bluewings.match.cqrs

import com.bluewings.match.domain.Match
import com.bluewings.match.domain.MatchStatus
import com.bluewings.match.repository.MatchRepository
import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.time.LocalDate

@QuarkusTest
class MatchQueryHandlerTest {

    @Inject
    lateinit var queryHandler: MatchQueryHandler

    @Inject
    lateinit var matchRepository: MatchRepository

    @Test
    @TestTransaction
    fun `시즌으로 경기 목록을 조회하면 해당 시즌 경기만 반환한다`() {
        val match = Match().apply {
            matchDate = LocalDate.of(2026, 3, 1)
            homeTeam = "수원 삼성"
            awayTeam = "FC서울"
            season = "2026-cqrs-test"
            status = MatchStatus.SCHEDULED
        }
        matchRepository.persist(match)

        val response = queryHandler.handle(GetMatchesBySeasonQuery("2026-cqrs-test"))

        assertEquals(1, response.matches.size)
        assertEquals("수원 삼성", response.matches[0].homeTeam)
    }

    @Test
    @TestTransaction
    fun `존재하지 않는 경기 ID를 조회하면 null을 반환한다`() {
        assertNull(queryHandler.handle(GetMatchByIdQuery(999_999L)))
    }

    @Test
    @TestTransaction
    fun `경기를 ID로 조회하면 상세 정보를 반환한다`() {
        val match = Match().apply {
            matchDate = LocalDate.of(2026, 4, 1)
            homeTeam = "수원 삼성"
            awayTeam = "울산"
            season = "2026-cqrs-test-2"
            status = MatchStatus.SCHEDULED
        }
        matchRepository.persist(match)

        val response = queryHandler.handle(GetMatchByIdQuery(match.id))

        assertNotNull(response)
        assertEquals("울산", response!!.awayTeam)
    }
}
```

- [ ] **Step 7: 테스트 실행**

Run: `./gradlew test --tests "com.bluewings.match.cqrs.MatchQueryHandlerTest"`
Expected: PASS (3 tests)

- [ ] **Step 8: 커밋**

```bash
git add src/main/kotlin/com/bluewings/match src/test/kotlin/com/bluewings/match
git commit -m "refactor(match): MatchService를 cqrs/MatchQueryHandler로 전환"
```

---

### Task 3: Report 모듈 — Service/ApiImpl 중복 로직 → CQRS 통합 + DTO 구조 정리

현재 `ReportService.createReport`(이메일로 신고자 조회)와 `ReportApiImpl.createReport`(사실상 미사용, ID로 신고자 조회)가 거의 동일한 로직을 중복 구현하고 있다. 이를 `ReportCommandHandler` 하나로 합치고, 두 진입점(`ReportResource`, `ReportApiImpl`)이 그것을 호출하게 한다. 동시에 `ReportResource`는 다른 리소스(`PostResource`, `CommentResource`, `NoticeResource`, `MemberResource`)와 동일하게 JWT `memberId` 클레임으로 본인 ID를 구하도록 통일한다(현재는 `SecurityContext.userPrincipal.name`으로 이메일을 받아 추가 DB 조회를 했음).

**Files:**
- Delete: `src/main/kotlin/com/bluewings/report/service/ReportService.kt`
- Delete: `src/main/kotlin/com/bluewings/report/dto/ReportRequest.kt`
- Create: `src/main/kotlin/com/bluewings/report/cqrs/ReportCommands.kt`
- Create: `src/main/kotlin/com/bluewings/report/cqrs/ReportCommandHandler.kt`
- Create: `src/main/kotlin/com/bluewings/report/dto/request/CreateReportRequest.kt`
- Modify: `src/main/kotlin/com/bluewings/report/resource/ReportResource.kt`
- Modify: `src/main/kotlin/com/bluewings/report/internal/ReportApiImpl.kt`
- Test: `src/test/kotlin/com/bluewings/report/cqrs/ReportCommandHandlerTest.kt`

**Interfaces:**
- Produces: `ReportCommandHandler.handle(CreateReportCommand): Long` — `reporterId: Long`(이메일 아님), `reportedMemberId: Long`, `reason: ReportReason`, `description: String?`, `contentType: ContentType?`, `contentId: Long?`
- Consumes (기존, 변경 없음): `MemberReportRepository.existsByReporterAndContent`, `MemberRepository.findById`, `ErrorCode.MEMBER_NOT_FOUND/CANNOT_REPORT_SELF/ALREADY_REPORTED`

- [ ] **Step 1: `report/cqrs/ReportCommands.kt` 작성**

```kotlin
package com.bluewings.report.cqrs

import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.ReportReason

data class CreateReportCommand(
    val reporterId: Long,
    val reportedMemberId: Long,
    val reason: ReportReason,
    val description: String?,
    val contentType: ContentType?,
    val contentId: Long?
)
```

- [ ] **Step 2: `report/cqrs/ReportCommandHandler.kt` 작성 (ReportService 로직 그대로 이관, 이메일 조회 제거)**

```kotlin
package com.bluewings.report.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class ReportCommandHandler(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) {

    @Transactional
    fun handle(command: CreateReportCommand): Long {
        val reporter = memberRepository.findById(command.reporterId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val reportedMember = memberRepository.findById(command.reportedMemberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (reporter.id == reportedMember.id) {
            throw BusinessException(ErrorCode.CANNOT_REPORT_SELF)
        }

        if (command.contentType != null && command.contentId != null) {
            val alreadyReported = reportRepository.existsByReporterAndContent(
                reporter.id!!,
                command.contentType.name,
                command.contentId
            )
            if (alreadyReported) {
                throw BusinessException(ErrorCode.ALREADY_REPORTED)
            }
        }

        val report = MemberReport(
            reporter = reporter,
            reportedMember = reportedMember,
            reason = command.reason,
            description = command.description,
            contentType = command.contentType,
            contentId = command.contentId
        )

        reportRepository.persist(report)

        return report.id!!
    }
}
```

- [ ] **Step 3: `ReportService.kt` 삭제**

```bash
git rm src/main/kotlin/com/bluewings/report/service/ReportService.kt
rmdir src/main/kotlin/com/bluewings/report/service 2>/dev/null || true
```

- [ ] **Step 4: 요청 DTO를 `dto/request/`로 이동**

```bash
mkdir -p src/main/kotlin/com/bluewings/report/dto/request
git mv src/main/kotlin/com/bluewings/report/dto/ReportRequest.kt src/main/kotlin/com/bluewings/report/dto/request/CreateReportRequest.kt
```

`CreateReportRequest.kt`의 패키지 선언을 `package com.bluewings.report.dto.request`로 바꾼다. 내용(필드, `@field:NotNull` 검증)은 그대로 둔다.

- [ ] **Step 5: `ReportResource.kt`를 `ReportCommandHandler` + JWT `memberId` 기반으로 재작성**

```kotlin
package com.bluewings.report.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.report.cqrs.CreateReportCommand
import com.bluewings.report.cqrs.ReportCommandHandler
import com.bluewings.report.dto.request.CreateReportRequest
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Report", description = "신고 API")
class ReportResource(
    private val commandHandler: ReportCommandHandler,
    private val jwt: JsonWebToken
) {
    private fun getCurrentMemberId(): Long {
        val claim = jwt.getClaim<Any>("memberId")
        return when (claim) {
            is Long -> claim
            is Number -> claim.toLong()
            is String -> claim.toLong()
            else -> jwt.subject.toLong()
        }
    }

    @POST
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "신고하기", description = "회원 또는 콘텐츠를 신고합니다")
    fun createReport(@Valid request: CreateReportRequest): ApiResponse<Long> {
        val command = CreateReportCommand(
            reporterId = getCurrentMemberId(),
            reportedMemberId = request.reportedMemberId,
            reason = request.reason,
            description = request.description,
            contentType = request.contentType,
            contentId = request.contentId
        )
        val reportId = commandHandler.handle(command)
        return ApiResponse.success(reportId)
    }
}
```

- [ ] **Step 6: `ReportApiImpl.kt`가 중복 로직 대신 `ReportCommandHandler`를 위임 호출하도록 변경**

```kotlin
package com.bluewings.report.internal

import com.bluewings.report.api.CreateReportRequest
import com.bluewings.report.api.ReportApi
import com.bluewings.report.api.ReportContentType
import com.bluewings.report.cqrs.CreateReportCommand
import com.bluewings.report.cqrs.ReportCommandHandler
import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.ReportReason
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped

/**
 * ReportApi 구현체
 */
@ApplicationScoped
class ReportApiImpl(
    private val reportRepository: MemberReportRepository,
    private val commandHandler: ReportCommandHandler
) : ReportApi {

    override fun createReport(request: CreateReportRequest): Long {
        val command = CreateReportCommand(
            reporterId = request.reporterId,
            reportedMemberId = request.targetMemberId,
            reason = ReportReason.valueOf(request.reason),
            description = request.details,
            contentType = request.contentType.toInternal(),
            contentId = request.contentId
        )
        return commandHandler.handle(command)
    }

    override fun countReportsByMember(memberId: Long): Long {
        return reportRepository.count("reportedMember.id = ?1", memberId)
    }

    override fun countReportsForContent(contentType: ReportContentType, contentId: Long): Long {
        return reportRepository.count(
            "contentType = ?1 and contentId = ?2",
            contentType.toInternal(), contentId
        )
    }

    private fun ReportContentType.toInternal(): ContentType {
        return when (this) {
            ReportContentType.POST -> ContentType.POST
            ReportContentType.COMMENT -> ContentType.COMMENT
            ReportContentType.CHAT_MESSAGE -> ContentType.CHAT
            ReportContentType.MEMBER -> ContentType.PROFILE
        }
    }
}
```

(`memberRepository`는 더 이상 필요 없으므로 주입에서 제거했다 — 신고자/피신고자 조회는 이제 `ReportCommandHandler` 내부에서 처리한다.)

- [ ] **Step 7: 컴파일 확인**

Run: `./gradlew compileKotlin`
Expected: BUILD SUCCESSFUL

- [ ] **Step 8: `ReportCommandHandler` 테스트 작성**

```kotlin
package com.bluewings.report.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.member.domain.Member
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.ReportReason
import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

@QuarkusTest
class ReportCommandHandlerTest {

    @Inject
    lateinit var commandHandler: ReportCommandHandler

    @Inject
    lateinit var memberRepository: MemberRepository

    @Test
    @TestTransaction
    fun `정상적인 신고는 신고 ID를 반환한다`() {
        val reporter = Member(email = "report-reporter@bluewings.com", password = "x", nickname = "신고자")
        val reported = Member(email = "report-reported@bluewings.com", password = "x", nickname = "피신고자")
        memberRepository.persist(reporter)
        memberRepository.persist(reported)

        val reportId = commandHandler.handle(
            CreateReportCommand(
                reporterId = reporter.id!!,
                reportedMemberId = reported.id!!,
                reason = ReportReason.SPAM,
                description = "테스트 신고",
                contentType = null,
                contentId = null
            )
        )

        assertNotNull(reportId)
    }

    @Test
    @TestTransaction
    fun `자기 자신을 신고하면 예외가 발생한다`() {
        val member = Member(email = "report-self@bluewings.com", password = "x", nickname = "본인")
        memberRepository.persist(member)

        val exception = assertThrows(BusinessException::class.java) {
            commandHandler.handle(
                CreateReportCommand(
                    reporterId = member.id!!,
                    reportedMemberId = member.id!!,
                    reason = ReportReason.OTHER,
                    description = null,
                    contentType = null,
                    contentId = null
                )
            )
        }

        assertEquals("R003", exception.errorCode.code)
    }
}
```

`ErrorCode`에 `code` 프로퍼티가 있는지 `src/main/kotlin/com/bluewings/common/exception/ErrorCode.kt`를 확인하고, 프로퍼티 이름이 다르면(`errorCode.code` 대신 다른 이름) 테스트를 그에 맞게 수정한다.

- [ ] **Step 9: 테스트 실행**

Run: `./gradlew test --tests "com.bluewings.report.cqrs.ReportCommandHandlerTest"`
Expected: PASS (2 tests)

- [ ] **Step 10: 커밋**

```bash
git add src/main/kotlin/com/bluewings/report src/test/kotlin/com/bluewings/report
git commit -m "refactor(report): Service/ApiImpl 중복 로직을 cqrs/ReportCommandHandler로 통합"
```

---

### Task 4: Chat 모듈 — CQRS 전환 + DTO 구조 정리

`ChatWebSocket.onMessage`의 메시지 저장 로직을 `ChatCommandHandler`로, `ChatResource.getHistory`의 조회 로직을 `ChatQueryHandler`로 옮긴다. `ChatWebSocket`은 연결 인증/차단 판단을 위해 `MemberRepository`가 계속 필요하지만(연결 상태 관리는 CQRS 대상이 아님), 메시지 영속화·차단회원 메시지 거부 로직은 handler로 위임한다. 기존 동작(차단 회원이면 소켓 종료, 내용이 비었거나 1000자 초과면 무시)을 그대로 보존하기 위해 `SendMessageOutcome`으로 결과를 구분해서 반환한다.

**Files:**
- Create: `src/main/kotlin/com/bluewings/chat/cqrs/ChatCommands.kt`
- Create: `src/main/kotlin/com/bluewings/chat/cqrs/ChatCommandHandler.kt`
- Create: `src/main/kotlin/com/bluewings/chat/cqrs/ChatQueries.kt`
- Create: `src/main/kotlin/com/bluewings/chat/cqrs/ChatQueryHandler.kt`
- Create: `src/main/kotlin/com/bluewings/chat/dto/request/ChatMessageRequest.kt`
- Create: `src/main/kotlin/com/bluewings/chat/dto/response/ChatResponses.kt`
- Delete: `src/main/kotlin/com/bluewings/chat/dto/ChatDtos.kt`
- Modify: `src/main/kotlin/com/bluewings/chat/resource/ChatResource.kt`
- Modify: `src/main/kotlin/com/bluewings/chat/resource/ChatWebSocket.kt`
- Test: `src/test/kotlin/com/bluewings/chat/cqrs/ChatCqrsHandlerTest.kt`

**Interfaces:**
- Produces: `ChatCommandHandler.handle(SendMessageCommand): SendMessageOutcome` (`SendMessageResult` enum: `SUCCESS`, `MEMBER_BLOCKED`, `MEMBER_NOT_FOUND`, `INVALID_CONTENT`; `SendMessageOutcome.response: ChatMessageResponse?`)
- Produces: `ChatQueryHandler.handle(GetChatHistoryQuery): ChatHistoryResponse`
- Consumes (기존, 변경 없음): `ChatMessageRepository.findRecentMessagesWithinMinutes`, `MemberRepository.findById`

- [ ] **Step 1: DTO를 `dto/request`/`dto/response`로 분리**

```bash
mkdir -p src/main/kotlin/com/bluewings/chat/dto/request src/main/kotlin/com/bluewings/chat/dto/response
git rm src/main/kotlin/com/bluewings/chat/dto/ChatDtos.kt
```

`src/main/kotlin/com/bluewings/chat/dto/request/ChatMessageRequest.kt`:
```kotlin
package com.bluewings.chat.dto.request

data class ChatMessageRequest(
    val content: String
)
```

`src/main/kotlin/com/bluewings/chat/dto/response/ChatResponses.kt`:
```kotlin
package com.bluewings.chat.dto.response

import java.time.Instant

data class ChatMessageResponse(
    val id: Long,
    val memberId: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val grade: String,
    val content: String,
    val createdAt: Instant
)

data class ChatHistoryResponse(
    val messages: List<ChatMessageResponse>,
    val hasMore: Boolean
)

data class ChatBroadcastMessage(
    val type: String, // "MESSAGE", "JOIN", "LEAVE"
    val message: ChatMessageResponse? = null,
    val nickname: String? = null,
    val onlineCount: Int? = null
)
```

- [ ] **Step 2: `chat/cqrs/ChatCommands.kt` 작성**

```kotlin
package com.bluewings.chat.cqrs

import com.bluewings.chat.dto.response.ChatMessageResponse

data class SendMessageCommand(
    val memberId: Long,
    val content: String
)

enum class SendMessageResult {
    SUCCESS, MEMBER_BLOCKED, MEMBER_NOT_FOUND, INVALID_CONTENT
}

data class SendMessageOutcome(
    val result: SendMessageResult,
    val response: ChatMessageResponse? = null
)
```

- [ ] **Step 3: `chat/cqrs/ChatCommandHandler.kt` 작성 (ChatWebSocket.onMessage 로직 이관)**

```kotlin
package com.bluewings.chat.cqrs

import com.bluewings.chat.domain.ChatMessage
import com.bluewings.chat.dto.response.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class ChatCommandHandler(
    private val chatMessageRepository: ChatMessageRepository,
    private val memberRepository: MemberRepository
) {
    companion object {
        private const val MAX_CONTENT_LENGTH = 1000
    }

    @Transactional
    fun handle(command: SendMessageCommand): SendMessageOutcome {
        val member = memberRepository.findById(command.memberId)
            ?: return SendMessageOutcome(SendMessageResult.MEMBER_NOT_FOUND)

        if (member.isBlocked) {
            return SendMessageOutcome(SendMessageResult.MEMBER_BLOCKED)
        }

        val content = command.content.trim()
        if (content.isBlank() || content.length > MAX_CONTENT_LENGTH) {
            return SendMessageOutcome(SendMessageResult.INVALID_CONTENT)
        }

        val chatMessage = ChatMessage(member = member, content = content)
        chatMessageRepository.persist(chatMessage)

        val response = ChatMessageResponse(
            id = chatMessage.id!!,
            memberId = member.id!!,
            nickname = member.nickname,
            profileImageUrl = member.profileImageUrl,
            grade = member.grade.name,
            content = chatMessage.content,
            createdAt = chatMessage.createdAt
        )

        return SendMessageOutcome(SendMessageResult.SUCCESS, response)
    }
}
```

- [ ] **Step 4: `chat/cqrs/ChatQueries.kt`, `ChatQueryHandler.kt` 작성 (ChatResource.getHistory 로직 이관)**

```kotlin
package com.bluewings.chat.cqrs

data class GetChatHistoryQuery(
    val beforeId: Long? = null,
    val limit: Int = 100
)
```

```kotlin
package com.bluewings.chat.cqrs

import com.bluewings.chat.dto.response.ChatHistoryResponse
import com.bluewings.chat.dto.response.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class ChatQueryHandler(
    private val chatMessageRepository: ChatMessageRepository
) {
    companion object {
        private const val MAX_HISTORY_MINUTES = 30L
    }

    fun handle(query: GetChatHistoryQuery): ChatHistoryResponse {
        // 초기 로드: 최근 30분 이내. 추가 로드(beforeId 있음)는 30분 제한으로 비활성화.
        val messages = if (query.beforeId != null) {
            emptyList()
        } else {
            chatMessageRepository.findRecentMessagesWithinMinutes(MAX_HISTORY_MINUTES, query.limit)
        }

        return ChatHistoryResponse(
            messages = messages.map { msg ->
                ChatMessageResponse(
                    id = msg.id!!,
                    memberId = msg.member.id!!,
                    nickname = msg.member.nickname,
                    profileImageUrl = msg.member.profileImageUrl,
                    grade = msg.member.grade.name,
                    content = msg.content,
                    createdAt = msg.createdAt
                )
            },
            hasMore = false
        )
    }
}
```

- [ ] **Step 5: `ChatResource.kt`를 `ChatQueryHandler` 기반으로 재작성**

```kotlin
package com.bluewings.chat.resource

import com.bluewings.chat.cqrs.ChatQueryHandler
import com.bluewings.chat.cqrs.GetChatHistoryQuery
import com.bluewings.chat.dto.response.ChatHistoryResponse
import com.bluewings.common.response.ApiResponse
import io.quarkus.security.Authenticated
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement

@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@SecurityRequirement(name = "bearerAuth")
class ChatResource(
    private val queryHandler: ChatQueryHandler
) {
    companion object {
        private const val MAX_HISTORY_LIMIT = 100
    }

    @GET
    @Path("/history")
    fun getHistory(
        @QueryParam("beforeId") beforeId: Long?,
        @QueryParam("limit") @DefaultValue("100") limit: Int
    ): ApiResponse<ChatHistoryResponse> {
        val safeLimit = limit.coerceIn(1, MAX_HISTORY_LIMIT)
        val response = queryHandler.handle(GetChatHistoryQuery(beforeId = beforeId, limit = safeLimit))
        return ApiResponse.success(response)
    }
}
```

- [ ] **Step 6: `ChatWebSocket.kt`가 `ChatCommandHandler`를 사용하도록 `onMessage` 수정**

`ChatWebSocket.kt`에서 import 블록의
```kotlin
import com.bluewings.chat.dto.ChatBroadcastMessage
import com.bluewings.chat.dto.ChatMessageRequest
import com.bluewings.chat.dto.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
```
를
```kotlin
import com.bluewings.chat.cqrs.ChatCommandHandler
import com.bluewings.chat.cqrs.SendMessageCommand
import com.bluewings.chat.cqrs.SendMessageResult
import com.bluewings.chat.dto.request.ChatMessageRequest
import com.bluewings.chat.dto.response.ChatBroadcastMessage
```
로 바꾼다.

필드 주입 블록에서
```kotlin
    @Inject
    lateinit var chatMessageRepository: ChatMessageRepository
```
를
```kotlin
    @Inject
    lateinit var chatCommandHandler: ChatCommandHandler
```
로 바꾼다 (`memberRepository` 필드는 `onOpen`의 인증/차단 확인에 계속 쓰이므로 그대로 둔다).

`onMessage` 본문 전체를 다음으로 교체한다:
```kotlin
    @OnTextMessage
    @Blocking
    @ActivateRequestContext
    @Transactional
    fun onMessage(connection: WebSocketConnection, message: String) {
        val memberId = connectionMembers[connection.id()] ?: return

        val request = try {
            objectMapper.readValue(message, ChatMessageRequest::class.java)
        } catch (e: Exception) {
            return
        }

        val outcome = chatCommandHandler.handle(SendMessageCommand(memberId, request.content))

        when (outcome.result) {
            SendMessageResult.MEMBER_BLOCKED -> connection.close()
            SendMessageResult.MEMBER_NOT_FOUND, SendMessageResult.INVALID_CONTENT -> return
            SendMessageResult.SUCCESS -> {
                val broadcastMessage = ChatBroadcastMessage(
                    type = "MESSAGE",
                    message = outcome.response
                )
                broadcast(objectMapper.writeValueAsString(broadcastMessage))
            }
        }
    }
```

(기존에 `onMessage` 안에서 하던 `memberRepository.findById` + 차단 확인 + 길이 검증 + `chatMessage` 생성/저장 코드는 전부 삭제하고 위 코드로 대체한다. `onOpen`/`onClose`/`kickMember`는 변경하지 않는다.)

- [ ] **Step 7: 컴파일 확인**

Run: `./gradlew compileKotlin`
Expected: BUILD SUCCESSFUL

- [ ] **Step 8: `ChatCommandHandler`/`ChatQueryHandler` 테스트 작성**

```kotlin
package com.bluewings.chat.cqrs

import com.bluewings.member.domain.Member
import com.bluewings.member.repository.MemberRepository
import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

@QuarkusTest
class ChatCqrsHandlerTest {

    @Inject
    lateinit var commandHandler: ChatCommandHandler

    @Inject
    lateinit var queryHandler: ChatQueryHandler

    @Inject
    lateinit var memberRepository: MemberRepository

    @Test
    @TestTransaction
    fun `정상 메시지를 보내면 SUCCESS와 함께 응답을 반환하고 히스토리에서 조회된다`() {
        val member = Member(email = "chat-sender@bluewings.com", password = "x", nickname = "채팅유저")
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "안녕하세요"))

        assertEquals(SendMessageResult.SUCCESS, outcome.result)
        assertEquals("안녕하세요", outcome.response?.content)

        val history = queryHandler.handle(GetChatHistoryQuery())
        assertTrue(history.messages.any { it.content == "안녕하세요" })
    }

    @Test
    @TestTransaction
    fun `차단된 회원이 메시지를 보내면 MEMBER_BLOCKED를 반환한다`() {
        val member = Member(
            email = "chat-blocked@bluewings.com",
            password = "x",
            nickname = "차단유저",
            isBlocked = true
        )
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "메시지"))

        assertEquals(SendMessageResult.MEMBER_BLOCKED, outcome.result)
    }

    @Test
    @TestTransaction
    fun `빈 내용이면 INVALID_CONTENT를 반환한다`() {
        val member = Member(email = "chat-empty@bluewings.com", password = "x", nickname = "빈메시지유저")
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "   "))

        assertEquals(SendMessageResult.INVALID_CONTENT, outcome.result)
    }
}
```

`Member` 생성자에 `isBlocked` 파라미터 이름이 실제와 다르면(예: 다른 이름) 태스크 실행자는 `src/main/kotlin/com/bluewings/member/domain/Member.kt`를 다시 확인해 맞춘다.

- [ ] **Step 9: 테스트 실행**

Run: `./gradlew test --tests "com.bluewings.chat.cqrs.ChatCqrsHandlerTest"`
Expected: PASS (3 tests)

- [ ] **Step 10: 커밋**

```bash
git add src/main/kotlin/com/bluewings/chat src/test/kotlin/com/bluewings/chat
git commit -m "refactor(chat): 메시지 저장/조회 로직을 cqrs/ChatCommandHandler,QueryHandler로 분리"
```

---

### Task 5: CLAUDE.md 문서화

이번 리팩터링으로 확정된 규칙과, 의도적으로 범위에서 제외한 결정(Module API 미배선, admin의 cross-module repository 사용)을 문서에 명시적으로 기록한다. 다음 사람(또는 AI)이 같은 조사를 반복하지 않도록 하는 것이 목적이다.

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** 없음 (문서 전용 태스크)

- [ ] **Step 1: "모듈러 모놀리스 아키텍처" 섹션에 레이어링/DTO 규칙 추가**

`CLAUDE.md`의 "### 핵심 원칙" 목록 아래에 다음 섹션을 새로 추가한다:

```markdown
### 레이어링 규칙 (2026-08-14 통일)

모든 백엔드 모듈(member/community/notice/match/chat/report)은 동일한 3계층 구조를 따른다:

```
resource/  →  cqrs/  →  repository/
(REST/WS)     (Command/Query + Handler)   (Panache)
```

- `resource/`는 Repository를 직접 주입하지 않는다. 반드시 `cqrs/`의 `XxxCommandHandler`/`XxxQueryHandler`를 통해서만 데이터에 접근한다.
- `cqrs/XxxCommands.kt`, `cqrs/XxxQueries.kt`: 순수 데이터 클래스, `jakarta.validation` 애노테이션 없음.
- `cqrs/XxxCommandHandler.kt`, `cqrs/XxxQueryHandler.kt`: `@ApplicationScoped` + 생성자 주입, `fun handle(command/query: Xxx): Result` 오버로드 방식.
- 검증(`@field:NotBlank` 등)은 `dto/request/`의 REST 요청 DTO에서만 한다. `dto/response/`는 REST 응답 DTO. 어느 한쪽이 필요 없는 모듈(예: match는 request 없음, report는 response 없음)은 해당 폴더를 만들지 않는다.
- 읽기 전용 모듈(match)은 Command 없이 `cqrs/`에 Query만 둔다.
- `ChatWebSocket`처럼 REST가 아닌 연결 상태를 직접 다루는 리소스는 예외적으로 `MemberRepository` 등을 인증/연결관리 목적에 한해 유지할 수 있다 — 단, 실제 비즈니스 로직(메시지 저장 등)은 반드시 `cqrs/` Handler로 위임한다.

### Module API 배선 보류 결정 (2026-08-14)

`member/community/notice/chat/match/report`의 `api/`, `internal/` 패키지(`MemberApi`, `CommunityApi` 등)는 여전히 미사용 상태로 유지한다. 이유:

- `Post.member`, `Notice.member`, `MemberReport.reporter/reportedMember`, `ChatMessage.member`가 전부 실제 JPA `@ManyToOne Member` 연관관계다. `MemberApi.getMemberInfo()`는 DTO(`MemberInfo`)를 반환하므로 이 자리에 대체할 수 없다.
- Module API로 완전히 전환하려면 이 연관관계들을 `memberId: Long` 컬럼으로 바꾸고 `JOIN FETCH` 기반 N+1 방지 쿼리들을 재설계해야 하는데, 이는 이번 CQRS/DTO 통일 작업보다 훨씬 큰 별도 작업이다.
- 따라서 community/notice/report가 다른 모듈에서 `MemberRepository`를 직접 참조하는 것은 **의도된 예외**로 유지한다(연관관계 설정 목적에 한함). 향후 엔티티를 ID 참조 방식으로 재설계하는 별도 프로젝트를 진행할 때 이 결정을 재검토한다.

### Admin의 cross-module Repository 직접 참조 (2026-08-14, 의도된 예외)

`admin/resource/AdminXxxResource.kt` 9개 파일은 여러 모듈의 Repository를 직접 주입한다. Admin은 페이지네이션/필터/차단·해제/필드 수정/통계 집계 등 각 모듈의 좁은 공개 API(`*Api.kt`, 4~6개 read-only 메서드)로는 충족할 수 없는 관리자 전용 CRUD가 필요하기 때문에, 관리 전용 합성 레이어로서 Repository 직접 접근을 허용한다. 이를 API 기반으로 바꾸려면 모듈마다 Admin 전용 API(페이지네이션/mutation 포함)를 새로 설계해야 하며, 이는 별도 계획으로 진행한다.
```

- [ ] **Step 2: 모듈 상세 구조 표 갱신**

"## 백엔드 모듈 상세 구조" 섹션의 `member/`, `community/`, `notice/`, `match/`, `chat/`, `report/` 하위에서 `command/`, `query/`, `service/`(match의 `MatchService.kt`, report의 `ReportService.kt`) 언급을 제거하고 모두 `cqrs/`로 통일해 표기한다. 예를 들어 `member/ (28개)` 항목의
```
│   ├── command/            # MemberCommandHandler.kt, MemberCommands.kt
│   ├── query/               # MemberQueries.kt, MemberQueryHandler.kt
```
를
```
│   ├── cqrs/                # MemberCommandHandler.kt, MemberCommands.kt, MemberQueries.kt, MemberQueryHandler.kt
```
로 바꾸고, `match/`, `chat/`, `report/` 항목에도 각각 `cqrs/` 라인을 추가한다(현재 문서에는 이 세 모듈의 세부 파일 목록이 없다면 새로 한 줄씩 추가한다).

- [ ] **Step 3: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: CQRS 레이어링 규칙 및 Module API/admin 예외 결정 기록"
```

---

## Self-Review 체크리스트 (계획 작성자가 이미 수행함)

- **Spec 커버리지**: 레이어 패턴 통일(Task 1~4), DTO 구조 통일(Task 3~4에 포함), Module API 범위 제외 기록(Task 5) — 사용자가 승인한 3가지 항목 모두 태스크로 존재함.
- **Placeholder 스캔**: 전 태스크의 코드 블록은 실제 완성된 Kotlin 코드이며 "TODO"/"similar to"류 표현 없음.
- **타입 일관성**: `MatchQueryHandler`/`ReportCommandHandler`/`ChatCommandHandler`의 메서드 시그니처는 각 Task의 "Interfaces" 절과 실제 Step 코드가 동일함을 재확인함.
