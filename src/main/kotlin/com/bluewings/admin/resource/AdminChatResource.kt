package com.bluewings.admin.resource

import com.bluewings.admin.dto.response.AdminChatMessageResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate

@Path("/api/admin/chat/messages")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Chat", description = "채팅 관리 API")
@RolesAllowed("ADMIN")
class AdminChatResource(
    private val chatMessageRepository: ChatMessageRepository
) {
    @GET
    @Operation(summary = "채팅 메시지 목록 조회", description = "페이지네이션된 채팅 메시지 목록을 조회합니다")
    fun getMessages(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("50") size: Int,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("authorNickname") authorNickname: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminChatMessageResponse>> {
        val result = chatMessageRepository.findWithFilters(
            keyword = keyword,
            authorNickname = authorNickname,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminChatMessageResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "채팅 메시지 삭제", description = "채팅 메시지를 삭제합니다")
    fun deleteMessage(@PathParam("id") id: Long): ApiResponse<Unit> {
        val message = chatMessageRepository.findById(id)
            ?: throw BusinessException(ErrorCode.CHAT_MESSAGE_NOT_FOUND)

        chatMessageRepository.delete(message)

        return ApiResponse.success(Unit)
    }
}
