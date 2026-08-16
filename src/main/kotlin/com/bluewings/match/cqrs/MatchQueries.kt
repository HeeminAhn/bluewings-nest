package com.bluewings.match.cqrs

data class GetMatchesBySeasonQuery(val season: String)

data class GetMatchesByMonthQuery(val year: Int, val month: Int)

data class GetUpcomingMatchesQuery(val limit: Int = 5)

data class GetMatchByIdQuery(val matchId: Long)

data class GetStandingsQuery(val season: String? = null)
