package com.bluewings.match.dto.response

import com.bluewings.match.domain.LeagueStanding

data class LeagueStandingResponse(
    val position: Int,
    val teamName: String,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int,
    val goalsFor: Int,
    val goalsAgainst: Int,
    val goalDifference: Int,
    val points: Int,
    val isSuwon: Boolean
) {
    companion object {
        fun from(standing: LeagueStanding): LeagueStandingResponse {
            return LeagueStandingResponse(
                position = standing.position,
                teamName = standing.teamName,
                played = standing.played,
                won = standing.won,
                drawn = standing.drawn,
                lost = standing.lost,
                goalsFor = standing.goalsFor,
                goalsAgainst = standing.goalsAgainst,
                goalDifference = standing.goalDifference,
                points = standing.points,
                isSuwon = standing.isSuwon
            )
        }
    }
}

data class StandingsResponse(
    val season: String,
    val standings: List<LeagueStandingResponse>,
    val suwonPosition: Int?
)
