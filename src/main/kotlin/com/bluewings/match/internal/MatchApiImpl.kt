package com.bluewings.match.internal

import com.bluewings.match.api.MatchApi
import com.bluewings.match.api.MatchInfo
import com.bluewings.match.domain.MatchStatus
import com.bluewings.match.repository.LeagueStandingRepository
import com.bluewings.match.repository.MatchRepository
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Year

/**
 * MatchApi 구현체
 */
@ApplicationScoped
class MatchApiImpl(
    private val matchRepository: MatchRepository,
    private val standingRepository: LeagueStandingRepository
) : MatchApi {

    override fun getNextMatch(): MatchInfo? {
        val today = LocalDate.now()
        val matches = matchRepository.list(
            "matchDate >= ?1 and status = ?2 order by matchDate asc, matchTime asc",
            today, MatchStatus.SCHEDULED
        )
        val nextMatch = matches.firstOrNull { it.isSuwonMatch } ?: return null

        return MatchInfo(
            id = nextMatch.id,
            homeTeam = nextMatch.homeTeam,
            awayTeam = nextMatch.awayTeam,
            matchDate = LocalDateTime.of(nextMatch.matchDate, nextMatch.matchTime ?: java.time.LocalTime.NOON),
            venue = nextMatch.stadium,
            homeScore = nextMatch.homeScore,
            awayScore = nextMatch.awayScore,
            isCompleted = nextMatch.status == MatchStatus.FINISHED
        )
    }

    override fun hasMatchToday(): Boolean {
        val today = LocalDate.now()
        return matchRepository.count(
            "matchDate = ?1 and (homeTeam like '%수원 삼성%' or homeTeam like '%블루윙즈%' or awayTeam like '%수원 삼성%' or awayTeam like '%블루윙즈%')",
            today
        ) > 0
    }

    override fun getCurrentRanking(): Int? {
        val currentSeason = Year.now().toString()
        val standing = standingRepository.find(
            "season = ?1 and (teamName like '%수원 삼성%' or teamName like '%블루윙즈%')", currentSeason
        ).firstResult()
        return standing?.position
    }

    override fun getMatchInfo(matchId: Long): MatchInfo? {
        val match = matchRepository.findById(matchId) ?: return null
        return MatchInfo(
            id = match.id,
            homeTeam = match.homeTeam,
            awayTeam = match.awayTeam,
            matchDate = LocalDateTime.of(match.matchDate, match.matchTime ?: java.time.LocalTime.NOON),
            venue = match.stadium,
            homeScore = match.homeScore,
            awayScore = match.awayScore,
            isCompleted = match.status == MatchStatus.FINISHED
        )
    }
}
