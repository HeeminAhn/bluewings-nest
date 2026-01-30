package com.bluewings.admin.resource

import com.bluewings.admin.dto.request.ProcessReportRequest
import com.bluewings.admin.dto.response.AdminReportResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.ReportStatus
import com.bluewings.report.repository.MemberReportRepository
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.SecurityContext
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate

@Path("/api/admin/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Report", description = "신고 관리 API")
@RolesAllowed("ADMIN")
class AdminReportResource(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) {
    @GET
    @Operation(summary = "신고 목록 조회", description = "페이지네이션된 신고 목록을 조회합니다")
    fun getReports(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("status") status: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminReportResponse>> {
        val result = reportRepository.findWithFilters(
            status = if (!status.isNullOrBlank()) ReportStatus.valueOf(status) else null,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminReportResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "신고 상세 조회", description = "신고 상세 정보를 조회합니다")
    fun getReport(@PathParam("id") id: Long): ApiResponse<AdminReportResponse> {
        val report = reportRepository.findById(id)
            ?: throw BusinessException(ErrorCode.REPORT_NOT_FOUND)

        return ApiResponse.success(AdminReportResponse.from(report))
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "신고 처리", description = "신고를 처리합니다")
    fun processReport(
        @PathParam("id") id: Long,
        @Valid request: ProcessReportRequest,
        @Context securityContext: SecurityContext
    ): ApiResponse<AdminReportResponse> {
        val report = reportRepository.findById(id)
            ?: throw BusinessException(ErrorCode.REPORT_NOT_FOUND)

        val adminEmail = securityContext.userPrincipal.name
        val admin = memberRepository.findByEmail(adminEmail)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        report.process(admin, request.status, request.adminNote)

        // 신고 승인 시 피신고자의 신고 횟수 증가
        if (request.status == ReportStatus.ACCEPTED) {
            report.reportedMember.incrementReportCount()
        }

        reportRepository.persist(report)

        return ApiResponse.success(AdminReportResponse.from(report))
    }

    @GET
    @Path("/pending/count")
    @Operation(summary = "대기 중인 신고 수 조회", description = "처리 대기 중인 신고 수를 조회합니다")
    fun getPendingCount(): ApiResponse<Long> {
        return ApiResponse.success(reportRepository.countPending())
    }

    @GET
    @Path("/member/{memberId}")
    @Operation(summary = "특정 회원의 신고 내역 조회", description = "특정 회원이 받은 신고 내역을 조회합니다")
    fun getMemberReports(
        @PathParam("memberId") memberId: Long,
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int
    ): ApiResponse<PagedResponse<AdminReportResponse>> {
        val reports = reportRepository.findByReportedMemberId(memberId, page, size)
        val totalCount = reportRepository.countByReportedMemberId(memberId)

        val response = PagedResponse(
            content = reports.map { AdminReportResponse.from(it) },
            totalElements = totalCount,
            totalPages = ((totalCount + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }
}
