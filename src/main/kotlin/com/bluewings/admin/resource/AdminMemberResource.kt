package com.bluewings.admin.resource

import com.bluewings.admin.dto.request.BlockMemberRequest
import com.bluewings.admin.dto.request.UpdateMemberRequest
import com.bluewings.admin.dto.response.AdminAccessLogResponse
import com.bluewings.admin.dto.response.AdminMemberResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.chat.api.ChatApi
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.member.api.MemberBlockedEvent
import com.bluewings.member.api.MemberUnblockedEvent
import com.bluewings.member.domain.MemberGrade
import com.bluewings.member.domain.MemberRole
import com.bluewings.member.repository.MemberAccessLogRepository
import com.bluewings.member.repository.MemberRepository
import com.bluewings.shared.kernel.EventBus
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
import java.time.ZoneId

@Path("/api/admin/members")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Member", description = "회원 관리 API")
@RolesAllowed("ADMIN")
class AdminMemberResource(
    private val memberRepository: MemberRepository,
    private val accessLogRepository: MemberAccessLogRepository,
    private val chatApi: ChatApi,
    private val eventBus: EventBus
) {
    @GET
    @Operation(summary = "회원 목록 조회", description = "페이지네이션된 회원 목록을 조회합니다")
    fun getMembers(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("role") role: String?,
        @QueryParam("grade") grade: String?,
        @QueryParam("isActive") isActive: String?,
        @QueryParam("isBlocked") isBlocked: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminMemberResponse>> {
        val query = StringBuilder()
        val params = mutableListOf<Any>()
        var paramIndex = 1

        // 검색어 필터
        if (!keyword.isNullOrBlank()) {
            query.append("(nickname like ?$paramIndex OR email like ?$paramIndex)")
            params.add("%$keyword%")
            paramIndex++
        }

        // 역할 필터
        if (!role.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("role = ?$paramIndex")
            params.add(MemberRole.valueOf(role))
            paramIndex++
        }

        // 등급 필터
        if (!grade.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("grade = ?$paramIndex")
            params.add(MemberGrade.valueOf(grade))
            paramIndex++
        }

        // 활성 상태 필터
        if (!isActive.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("isActive = ?$paramIndex")
            params.add(isActive.toBoolean())
            paramIndex++
        }

        // 차단 상태 필터
        if (!isBlocked.isNullOrBlank()) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("isBlocked = ?$paramIndex")
            params.add(isBlocked.toBoolean())
            paramIndex++
        }

        // 가입일 시작 필터
        if (startDate != null) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("createdAt >= ?$paramIndex")
            params.add(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant())
            paramIndex++
        }

        // 가입일 종료 필터
        if (endDate != null) {
            if (query.isNotEmpty()) query.append(" AND ")
            query.append("createdAt < ?$paramIndex")
            params.add(endDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant())
            paramIndex++
        }

        val queryString = query.toString().ifEmpty { null }
        val sort = Sort.by("createdAt").descending()

        val members = if (queryString != null) {
            memberRepository.find(queryString, sort, *params.toTypedArray())
                .page(Page.of(page, size))
                .list()
        } else {
            memberRepository.findAll(sort)
                .page(Page.of(page, size))
                .list()
        }

        val totalCount = if (queryString != null) {
            memberRepository.count(queryString, *params.toTypedArray())
        } else {
            memberRepository.count()
        }

        val response = PagedResponse(
            content = members.map { AdminMemberResponse.from(it) },
            totalElements = totalCount,
            totalPages = ((totalCount + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "회원 상세 조회", description = "회원 상세 정보를 조회합니다")
    fun getMember(@PathParam("id") id: Long): ApiResponse<AdminMemberResponse> {
        val member = memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        return ApiResponse.success(AdminMemberResponse.from(member))
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "회원 정보 수정", description = "회원의 역할 또는 상태를 수정합니다")
    fun updateMember(
        @PathParam("id") id: Long,
        @Valid request: UpdateMemberRequest
    ): ApiResponse<AdminMemberResponse> {
        val member = memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        request.role?.let { member.role = it }
        request.isActive?.let { member.isActive = it }
        member.updatedAt = Instant.now()

        memberRepository.persist(member)

        return ApiResponse.success(AdminMemberResponse.from(member))
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "회원 정보 수정 (PUT)", description = "회원의 역할 또는 상태를 수정합니다")
    fun updateMemberPut(
        @PathParam("id") id: Long,
        @Valid request: UpdateMemberRequest
    ): ApiResponse<AdminMemberResponse> {
        return updateMember(id, request)
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "회원 비활성화", description = "회원을 비활성화합니다")
    fun deactivateMember(@PathParam("id") id: Long): ApiResponse<Unit> {
        val member = memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        member.deactivate()
        memberRepository.persist(member)

        return ApiResponse.success(Unit)
    }

    @POST
    @Path("/{id}/block")
    @Transactional
    @Operation(summary = "회원 차단", description = "회원을 차단합니다")
    fun blockMember(
        @PathParam("id") id: Long,
        @Valid request: BlockMemberRequest
    ): ApiResponse<AdminMemberResponse> {
        val member = memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        member.block(request.reason, request.until)
        memberRepository.persist(member)

        // 회원 차단 이벤트 발행 -> Chat 모듈에서 강제 퇴장 처리
        eventBus.publish(MemberBlockedEvent(
            memberId = id,
            reason = request.reason,
            isPermanent = request.until == null
        ))

        return ApiResponse.success(AdminMemberResponse.from(member))
    }

    @POST
    @Path("/{id}/unblock")
    @Transactional
    @Operation(summary = "회원 차단 해제", description = "회원의 차단을 해제합니다")
    fun unblockMember(@PathParam("id") id: Long): ApiResponse<AdminMemberResponse> {
        val member = memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        member.unblock()
        memberRepository.persist(member)

        // 회원 차단 해제 이벤트 발행
        eventBus.publish(MemberUnblockedEvent(memberId = id))

        return ApiResponse.success(AdminMemberResponse.from(member))
    }

    @GET
    @Path("/{id}/access-logs")
    @Operation(summary = "회원 접속 이력 조회", description = "특정 회원의 접속 이력을 조회합니다")
    fun getMemberAccessLogs(
        @PathParam("id") id: Long,
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int
    ): ApiResponse<PagedResponse<AdminAccessLogResponse>> {
        // 회원 존재 확인
        memberRepository.findById(id)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val logs = accessLogRepository.findByMemberId(id, page, size)
        val totalCount = accessLogRepository.countByMemberId(id)

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
