package com.bluewings.notice.resource

import com.bluewings.common.pagination.PageParams
import com.bluewings.common.response.ApiResponse
import com.bluewings.notice.cqrs.*
import com.bluewings.notice.dto.request.CreateNoticeRequest
import com.bluewings.notice.dto.request.ImageRequest
import com.bluewings.notice.dto.request.UpdateNoticeRequest
import com.bluewings.notice.dto.response.NoticeListResponse
import com.bluewings.notice.dto.response.NoticeResponse
import com.bluewings.notice.dto.response.PagedNoticeResponse
import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/notices")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Notice", description = "공지사항 API")
class NoticeResource(
    private val commandHandler: NoticeCommandHandler,
    private val queryHandler: NoticeQueryHandler,
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

    @GET
    @PermitAll
    @Operation(summary = "공지사항 목록 조회", description = "페이지네이션된 공지사항 목록을 조회합니다 (고정 공지 우선)")
    fun getNotices(@Valid @BeanParam pageParams: PageParams): ApiResponse<PagedNoticeResponse> {
        val query = GetNoticesPagedQuery(page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/search")
    @PermitAll
    @Operation(summary = "공지사항 검색", description = "제목으로 공지사항을 검색합니다")
    fun searchNotices(
        @QueryParam("keyword") keyword: String,
        @Valid @BeanParam pageParams: PageParams
    ): ApiResponse<PagedNoticeResponse> {
        val query = SearchNoticesQuery(keyword = keyword, page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/pinned")
    @PermitAll
    @Operation(summary = "고정 공지사항 조회", description = "고정된 공지사항만 조회합니다")
    fun getPinnedNotices(): ApiResponse<List<NoticeListResponse>> {
        val result = queryHandler.handle(GetPinnedNoticesQuery())
        return ApiResponse.success(result)
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "공지사항 상세 조회", description = "공지사항 상세 정보를 조회하고 조회수를 증가시킵니다")
    fun getNotice(@PathParam("id") id: Long): ApiResponse<NoticeResponse> {
        commandHandler.handle(IncrementNoticeViewCountCommand(id))
        val query = GetNoticeByIdQuery(noticeId = id)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @POST
    @RolesAllowed("ADMIN")
    @Operation(summary = "공지사항 작성", description = "새로운 공지사항을 작성합니다 (관리자 전용)")
    fun createNotice(@Valid request: CreateNoticeRequest): ApiResponse<NoticeResponse> {
        val command = CreateNoticeCommand(
            memberId = getCurrentMemberId(),
            title = request.title,
            content = request.content,
            isPinned = request.isPinned,
            images = request.images.map { it.toImageData() }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    private fun ImageRequest.toImageData() = ImageData(
        fileName = fileName,
        originalName = originalName,
        filePath = filePath,
        fileSize = fileSize,
        contentType = contentType
    )

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "공지사항 수정", description = "공지사항을 수정합니다 (관리자 전용)")
    fun updateNotice(
        @PathParam("id") id: Long,
        @Valid request: UpdateNoticeRequest
    ): ApiResponse<NoticeResponse> {
        val command = UpdateNoticeCommand(
            noticeId = id,
            memberId = getCurrentMemberId(),
            title = request.title,
            content = request.content,
            isPinned = request.isPinned,
            images = request.images.map { it.toImageData() }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다 (관리자 전용)")
    fun deleteNotice(@PathParam("id") id: Long): ApiResponse<Unit> {
        val command = DeleteNoticeCommand(
            noticeId = id,
            memberId = getCurrentMemberId()
        )
        commandHandler.handle(command)
        return ApiResponse.success(Unit)
    }
}
