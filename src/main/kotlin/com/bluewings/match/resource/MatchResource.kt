package com.bluewings.match.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.match.dto.response.MatchListResponse
import com.bluewings.match.dto.response.MatchResponse
import com.bluewings.match.dto.response.StandingsResponse
import com.bluewings.match.dto.response.UpcomingMatchesResponse
import com.bluewings.match.service.MatchService
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import java.time.Year

@Path("/api/matches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
class MatchResource {

    @Inject
    lateinit var matchService: MatchService

    @GET
    fun getMatches(
        @QueryParam("season") season: String?,
        @QueryParam("year") year: Int?,
        @QueryParam("month") month: Int?
    ): ApiResponse<MatchListResponse> {
        val response = if (year != null && month != null) {
            matchService.getMatchesByMonth(year, month)
        } else {
            val targetSeason = season ?: Year.now().value.toString()
            matchService.getMatchesBySeason(targetSeason)
        }
        return ApiResponse.success(response)
    }

    @GET
    @Path("/upcoming")
    fun getUpcomingMatches(): ApiResponse<UpcomingMatchesResponse> {
        val response = matchService.getUpcomingAndRecentMatches()
        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    fun getMatch(@PathParam("id") id: Long): ApiResponse<MatchResponse> {
        val match = matchService.getMatch(id)
            ?: throw NotFoundException("경기를 찾을 수 없습니다.")
        return ApiResponse.success(match)
    }

    @GET
    @Path("/standings")
    fun getStandings(@QueryParam("season") season: String?): ApiResponse<StandingsResponse> {
        val response = matchService.getStandings(season)
        return ApiResponse.success(response)
    }
}
