package com.bluewings.report.resource

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.dto.CreateReportRequest
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

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Report", description = "신고 API")
class ReportResource(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) {
    @POST
    @RolesAllowed("USER", "ADMIN")
    @Transactional
    @Operation(summary = "신고하기", description = "회원 또는 콘텐츠를 신고합니다")
    fun createReport(
        @Valid request: CreateReportRequest,
        @Context securityContext: SecurityContext
    ): ApiResponse<Long> {
        val reporterEmail = securityContext.userPrincipal.name
        val reporter = memberRepository.findByEmail(reporterEmail)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val reportedMember = memberRepository.findById(request.reportedMemberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        // 자기 자신 신고 불가
        if (reporter.id == reportedMember.id) {
            throw BusinessException(ErrorCode.CANNOT_REPORT_SELF)
        }

        // 동일 콘텐츠 중복 신고 체크
        if (request.contentType != null && request.contentId != null) {
            val alreadyReported = reportRepository.existsByReporterAndContent(
                reporter.id!!,
                request.contentType.name,
                request.contentId
            )
            if (alreadyReported) {
                throw BusinessException(ErrorCode.ALREADY_REPORTED)
            }
        }

        val report = MemberReport(
            reporter = reporter,
            reportedMember = reportedMember,
            reason = request.reason,
            description = request.description,
            contentType = request.contentType,
            contentId = request.contentId
        )

        reportRepository.persist(report)

        return ApiResponse.success(report.id!!)
    }
}
