package com.bluewings.admin.resource

import com.bluewings.admin.dto.response.*
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostRepository
import com.bluewings.match.domain.MatchStatus
import com.bluewings.match.repository.MatchRepository
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.repository.MemberReportRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit

@Path("/api/admin/stats")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Stats", description = "관리자 통계 API")
@RolesAllowed("ADMIN")
class AdminStatsResource(
    private val memberRepository: MemberRepository,
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val matchRepository: MatchRepository,
    private val reportRepository: MemberReportRepository
) {
    @GET
    @Operation(summary = "대시보드 통계 조회", description = "관리자 대시보드 통계를 조회합니다")
    fun getDashboardStats(): ApiResponse<DashboardStatsResponse> {
        val totalMembers = memberRepository.count()
        val totalPosts = postRepository.count()
        val totalComments = commentRepository.count()

        // 오늘 시작 시간 (한국 시간 기준)
        val todayStart = LocalDate.now().atStartOfDay(ZoneId.of("Asia/Seoul")).toInstant()
        val todayStartDateTime = LocalDateTime.now().toLocalDate().atStartOfDay()

        // 오늘 신규 가입자 수
        val todayNewMembers = memberRepository.count("createdAt >= ?1", todayStart)

        // 오늘 새 게시글 수
        val todayNewPosts = postRepository.count("createdAt >= ?1", todayStartDateTime)

        // 최근 게시글 5개
        val recentPosts = postRepository.findAll(Sort.by("createdAt").descending())
            .page(Page.of(0, 5))
            .list()
            .map { RecentPostInfo(it.id, it.title, it.member.nickname, it.createdAt) }

        // 최근 가입 회원 5명
        val recentMembers = memberRepository.findAll(Sort.by("createdAt").descending())
            .page(Page.of(0, 5))
            .list()
            .map { RecentMemberInfo(it.id!!, it.nickname, it.email, it.createdAt) }

        // 다가오는 경기 5개
        val upcomingMatches = matchRepository.findUpcoming(5)
            .map { UpcomingMatchInfo(it.id, it.homeTeam, it.awayTeam, it.matchDate, it.competition) }

        // 대기 중인 신고 수
        val pendingReports = reportRepository.countPending()

        // 차단된 회원 수
        val blockedMembers = memberRepository.count("isBlocked", true)

        val response = DashboardStatsResponse(
            totalMembers = totalMembers,
            totalPosts = totalPosts,
            totalComments = totalComments,
            todayNewMembers = todayNewMembers,
            todayNewPosts = todayNewPosts,
            pendingReports = pendingReports,
            blockedMembers = blockedMembers,
            recentPosts = recentPosts,
            recentMembers = recentMembers,
            upcomingMatches = upcomingMatches
        )

        return ApiResponse.success(response)
    }
}
