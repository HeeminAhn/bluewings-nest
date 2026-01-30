package com.bluewings.match.service

import com.bluewings.match.dto.response.*
import com.bluewings.match.repository.LeagueStandingRepository
import com.bluewings.match.repository.MatchRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import java.time.Year

@ApplicationScoped
class MatchService {

    @Inject
    lateinit var matchRepository: MatchRepository

    @Inject
    lateinit var standingRepository: LeagueStandingRepository

    fun getMatchesBySeason(season: String): MatchListResponse {
        val matches = matchRepository.findBySeasonOrderByMatchDate(season)
        return MatchListResponse(
            matches = matches.map { MatchResponse.from(it) },
            season = season
        )
    }

    fun getMatchesByMonth(year: Int, month: Int): MatchListResponse {
        val matches = matchRepository.findByYearMonth(year, month)
        return MatchListResponse(
            matches = matches.map { MatchResponse.from(it) },
            season = year.toString()
        )
    }

    fun getUpcomingAndRecentMatches(): UpcomingMatchesResponse {
        val upcoming = matchRepository.findUpcoming(5)
        val recent = matchRepository.findRecent(5)
        return UpcomingMatchesResponse(
            upcoming = upcoming.map { MatchResponse.from(it) },
            recent = recent.map { MatchResponse.from(it) }
        )
    }

    fun getStandings(season: String? = null): StandingsResponse {
        val targetSeason = season ?: Year.now().value.toString()
        val standings = standingRepository.findBySeasonOrderByPosition(targetSeason)
        val suwonStanding = standings.find { it.isSuwon }

        return StandingsResponse(
            season = targetSeason,
            standings = standings.map { LeagueStandingResponse.from(it) },
            suwonPosition = suwonStanding?.position
        )
    }

    fun getMatch(id: Long): MatchResponse? {
        return matchRepository.findById(id)?.let { MatchResponse.from(it) }
    }
}
