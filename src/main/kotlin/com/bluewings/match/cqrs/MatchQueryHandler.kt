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
