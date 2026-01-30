package com.bluewings.match.repository

import com.bluewings.match.domain.Match
import com.bluewings.match.domain.MatchStatus
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDate

@ApplicationScoped
class MatchRepository : PanacheRepository<Match> {

    fun findBySeason(season: String): List<Match> =
        list("season", season)

    fun findBySeasonOrderByMatchDate(season: String): List<Match> =
        list("season = ?1 ORDER BY matchDate ASC, matchTime ASC", season)

    fun findUpcoming(limit: Int = 5): List<Match> =
        list("matchDate >= ?1 AND status = ?2 ORDER BY matchDate ASC, matchTime ASC",
            LocalDate.now(), MatchStatus.SCHEDULED)
            .take(limit)

    fun findRecent(limit: Int = 5): List<Match> =
        list("status = ?1 ORDER BY matchDate DESC, matchTime DESC", MatchStatus.FINISHED)
            .take(limit)

    fun findByDateRange(startDate: LocalDate, endDate: LocalDate): List<Match> =
        list("matchDate >= ?1 AND matchDate <= ?2 ORDER BY matchDate ASC, matchTime ASC",
            startDate, endDate)

    fun findByYearMonth(year: Int, month: Int): List<Match> {
        val startDate = LocalDate.of(year, month, 1)
        val endDate = startDate.withDayOfMonth(startDate.lengthOfMonth())
        return findByDateRange(startDate, endDate)
    }
}
