package com.bluewings.report.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.report.dto.CreateReportRequest
import com.bluewings.report.service.ReportService
import jakarta.annotation.security.RolesAllowed
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
    private val reportService: ReportService
) {
    @POST
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "신고하기", description = "회원 또는 콘텐츠를 신고합니다")
    fun createReport(
        @Valid request: CreateReportRequest,
        @Context securityContext: SecurityContext
    ): ApiResponse<Long> {
        val reporterEmail = securityContext.userPrincipal.name
        val reportId = reportService.createReport(reporterEmail, request)
        return ApiResponse.success(reportId)
    }
}
