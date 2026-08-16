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
