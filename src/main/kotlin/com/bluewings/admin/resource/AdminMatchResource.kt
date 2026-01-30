package com.bluewings.admin.resource

import com.bluewings.admin.dto.request.CreateMatchRequest
import com.bluewings.admin.dto.request.UpdateMatchRequest
import com.bluewings.admin.dto.request.UpdateStandingsRequest
import com.bluewings.admin.dto.response.AdminMatchResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.match.domain.LeagueStanding
import com.bluewings.match.domain.Match
import com.bluewings.match.domain.MatchStatus
import com.bluewings.match.repository.LeagueStandingRepository
import com.bluewings.match.repository.MatchRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.Instant
import java.time.LocalDate
import java.time.Year

@Path("/api/admin/matches")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Match", description = "경기 관리 API")
@RolesAllowed("ADMIN")
class
AdminMatchResource(
    private val matchRepository: MatchRepository,
    private val standingRepository: LeagueStandingRepository
) {
    @GET
    @Operation(summary = "경기 목록 조회", description = "페이지네이션된 경기 목록을 조회합니다")
    fun getMatches(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("season") season: String?,
        @QueryParam("status") status: String?,
        @QueryParam("competition") competition: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminMatchResponse>> {
        val query = StringBuilder()
        val params = mutableListOf<Any>()
        var paramIndex = 1

        // 시즌 필터 (선택적)
        if (!season.isNullOrBlank()) {
            query.append("season = ?$paramIndex")
            params.add(season)
            paramIndex++
        }

        // 상태 필터
        if (!status.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("status = ?$paramIndex")
            params.add(MatchStatus.valueOf(status))
            paramIndex++
        }

        // 대회 필터
        if (!competition.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("competition = ?$paramIndex")
            params.add(competition)
            paramIndex++
        }

        // 경기일 시작 필터
        if (startDate != null) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("matchDate >= ?$paramIndex")
            params.add(startDate)
            paramIndex++
        }

        // 경기일 종료 필터
        if (endDate != null) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("matchDate <= ?$paramIndex")
            params.add(endDate)
            paramIndex++
        }

        val sort = Sort.by("matchDate").descending().and("matchTime").descending()

        val queryString = query.toString().ifEmpty { null }

        val matches = if (queryString != null) {
            matchRepository.find(queryString, sort, *params.toTypedArray())
                .page(Page.of(page, size))
                .list()
        } else {
            matchRepository.findAll(sort)
                .page(Page.of(page, size))
                .list()
        }

        val totalCount = if (queryString != null) {
            matchRepository.count(queryString, *params.toTypedArray())
        } else {
            matchRepository.count()
        }

        val response = PagedResponse(
            content = matches.map { AdminMatchResponse.from(it) },
            totalElements = totalCount,
            totalPages = ((totalCount + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "경기 상세 조회", description = "경기 상세 정보를 조회합니다")
    fun getMatch(@PathParam("id") id: Long): ApiResponse<AdminMatchResponse> {
        val match = matchRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MATCH_NOT_FOUND)

        return ApiResponse.success(AdminMatchResponse.from(match))
    }

    @POST
    @Transactional
    @Operation(summary = "경기 생성", description = "새로운 경기를 등록합니다")
    fun createMatch(@Valid request: CreateMatchRequest): ApiResponse<AdminMatchResponse> {
        val match = Match().apply {
            matchDate = request.matchDate
            matchTime = request.matchTime
            homeTeam = request.homeTeam
            awayTeam = request.awayTeam
            homeScore = request.homeScore
            awayScore = request.awayScore
            stadium = request.stadium
            competition = request.competition
            season = request.season
            matchDay = request.matchDay
            status = request.status
        }

        matchRepository.persist(match)

        return ApiResponse.success(AdminMatchResponse.from(match))
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "경기 수정", description = "경기 정보를 수정합니다")
    fun updateMatch(
        @PathParam("id") id: Long,
        @Valid request: UpdateMatchRequest
    ): ApiResponse<AdminMatchResponse> {
        val match = matchRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MATCH_NOT_FOUND)

        request.matchDate?.let { match.matchDate = it }
        request.matchTime?.let { match.matchTime = it }
        request.homeTeam?.let { match.homeTeam = it }
        request.awayTeam?.let { match.awayTeam = it }
        request.homeScore?.let { match.homeScore = it }
        request.awayScore?.let { match.awayScore = it }
        request.stadium?.let { match.stadium = it }
        request.competition?.let { match.competition = it }
        request.season?.let { match.season = it }
        request.matchDay?.let { match.matchDay = it }
        request.status?.let { match.status = it }
        match.updatedAt = Instant.now()

        matchRepository.persist(match)

        return ApiResponse.success(AdminMatchResponse.from(match))
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "경기 삭제", description = "경기를 삭제합니다")
    fun deleteMatch(@PathParam("id") id: Long): ApiResponse<Unit> {
        val match = matchRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MATCH_NOT_FOUND)

        matchRepository.delete(match)

        return ApiResponse.success(Unit)
    }

    @PUT
    @Path("/standings")
    @Transactional
    @Operation(summary = "순위표 업데이트", description = "리그 순위표를 업데이트합니다")
    fun updateStandings(@Valid request: UpdateStandingsRequest): ApiResponse<Unit> {
        val currentSeason = Year.now().value.toString()

        request.standings.forEach { entry ->
            var standing = standingRepository.findBySeasonAndTeam(currentSeason, entry.teamName)

            if (standing == null) {
                standing = LeagueStanding().apply {
                    season = currentSeason
                    teamName = entry.teamName
                }
            }

            standing.apply {
                position = entry.position
                played = entry.played
                won = entry.won
                drawn = entry.drawn
                lost = entry.lost
                goalsFor = entry.goalsFor
                goalsAgainst = entry.goalsAgainst
                goalDifference = entry.goalsFor - entry.goalsAgainst
                points = entry.points
                updatedAt = Instant.now()
            }

            standingRepository.persist(standing)
        }

        return ApiResponse.success(Unit)
    }
}
