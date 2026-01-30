package com.bluewings.admin.resource

import com.bluewings.admin.dto.response.AdminAccessLogResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.response.ApiResponse
import com.bluewings.member.repository.MemberAccessLogRepository
import jakarta.annotation.security.RolesAllowed
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate
import java.time.ZoneId

@Path("/api/admin/access-logs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Access Log", description = "접속 이력 관리 API")
@RolesAllowed("ADMIN")
class AdminAccessLogResource(
    private val accessLogRepository: MemberAccessLogRepository
) {
    @GET
    @Operation(summary = "전체 접속 이력 조회", description = "전체 접속 이력을 조회합니다")
    fun getAccessLogs(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("email") email: String?,
        @QueryParam("ipAddress") ipAddress: String?,
        @QueryParam("isSuccess") isSuccess: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminAccessLogResponse>> {
        val result = accessLogRepository.findWithFilters(
            email = email,
            ipAddress = ipAddress,
            isSuccess = if (!isSuccess.isNullOrBlank()) isSuccess.toBoolean() else null,
            startDate = startDate?.atStartOfDay(ZoneId.systemDefault())?.toInstant(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(ZoneId.systemDefault())?.toInstant(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminAccessLogResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/ip/{ipAddress}")
    @Operation(summary = "IP별 접속 이력 조회", description = "특정 IP의 접속 이력을 조회합니다")
    fun getAccessLogsByIp(
        @PathParam("ipAddress") ipAddress: String,
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int
    ): ApiResponse<PagedResponse<AdminAccessLogResponse>> {
        val logs = accessLogRepository.findByIpAddress(ipAddress, page, size)
        val totalCount = accessLogRepository.count("ipAddress", ipAddress)

        val response = PagedResponse(
            content = logs.map { AdminAccessLogResponse.from(it) },
            totalElements = totalCount,
            totalPages = ((totalCount + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }
}
