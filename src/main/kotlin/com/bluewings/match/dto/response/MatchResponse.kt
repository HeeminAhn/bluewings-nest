package com.bluewings.match.dto.response

import com.bluewings.match.domain.Match
import com.bluewings.match.domain.MatchStatus
import java.time.LocalDate
import java.time.LocalTime

data class MatchResponse(
    val id: Long,
    val matchDate: LocalDate,
    val matchTime: LocalTime?,
    val homeTeam: String,
    val awayTeam: String,
    val homeScore: Int?,
    val awayScore: Int?,
    val stadium: String?,
    val competition: String,
    val season: String,
    val matchDay: Int?,
    val status: MatchStatus,
    val isHomeGame: Boolean,
    val result: String?
) {
    companion object {
        fun from(match: Match): MatchResponse {
            val result = if (match.status == MatchStatus.FINISHED && match.homeScore != null && match.awayScore != null) {
                val suwonScore: Int
                val opponentScore: Int
                if (match.homeTeam.contains("수원 삼성") || match.homeTeam.contains("블루윙즈")) {
                    suwonScore = match.homeScore!!
                    opponentScore = match.awayScore!!
                } else {
                    suwonScore = match.awayScore!!
                    opponentScore = match.homeScore!!
                }
                when {
                    suwonScore > opponentScore -> "WIN"
                    suwonScore < opponentScore -> "LOSE"
                    else -> "DRAW"
                }
            } else null

            return MatchResponse(
                id = match.id,
                matchDate = match.matchDate,
                matchTime = match.matchTime,
                homeTeam = match.homeTeam,
                awayTeam = match.awayTeam,
                homeScore = match.homeScore,
                awayScore = match.awayScore,
                stadium = match.stadium,
                competition = match.competition,
                season = match.season,
                matchDay = match.matchDay,
                status = match.status,
                isHomeGame = match.isHomeGame,
                result = result
            )
        }
    }
}

data class MatchListResponse(
    val matches: List<MatchResponse>,
    val season: String
)

data class UpcomingMatchesResponse(
    val upcoming: List<MatchResponse>,
    val recent: List<MatchResponse>
)
