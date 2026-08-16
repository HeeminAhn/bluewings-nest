package com.bluewings.report.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.report.cqrs.CreateReportCommand
import com.bluewings.report.cqrs.ReportCommandHandler
import com.bluewings.report.dto.request.CreateReportRequest
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Report", description = "신고 API")
class ReportResource(
    private val commandHandler: ReportCommandHandler,
    private val jwt: JsonWebToken
) {
    private fun getCurrentMemberId(): Long {
        val claim = jwt.getClaim<Any>("memberId")
        return when (claim) {
            is Long -> claim
            is Number -> claim.toLong()
            is String -> claim.toLong()
            else -> jwt.subject.toLong()
        }
    }

    @POST
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "신고하기", description = "회원 또는 콘텐츠를 신고합니다")
    fun createReport(@Valid request: CreateReportRequest): ApiResponse<Long> {
        val command = CreateReportCommand(
            reporterId = getCurrentMemberId(),
            reportedMemberId = request.reportedMemberId,
            reason = request.reason,
            description = request.description,
            contentType = request.contentType,
            contentId = request.contentId
        )
        val reportId = commandHandler.handle(command)
        return ApiResponse.success(reportId)
    }
}
