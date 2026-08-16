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
