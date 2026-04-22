package com.bluewings.chat.resource

import com.bluewings.chat.dto.ChatHistoryResponse
import com.bluewings.chat.dto.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.common.response.ApiResponse
import io.quarkus.security.Authenticated
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType

@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
class ChatResource {

    @Inject
    lateinit var chatMessageRepository: ChatMessageRepository

    companion object {
        private const val MAX_HISTORY_MINUTES = 30L  // 최대 30분 전까지
        private const val MAX_HISTORY_LIMIT = 100    // 최대 100개
    }

    @GET
    @Path("/history")
    fun getHistory(
        @QueryParam("beforeId") beforeId: Long?,
        @QueryParam("limit") @DefaultValue("100") limit: Int
    ): ApiResponse<ChatHistoryResponse> {
        val safeLimit = limit.coerceIn(1, MAX_HISTORY_LIMIT)

        // 초기 로드: 최근 30분 이내, 최대 100개
        // 추가 로드(beforeId 있음): 더 이상 로드하지 않음 (30분 제한)
        val messages = if (beforeId != null) {
            // 이전 메시지 로드는 비활성화 (30분 제한으로 인해)
            emptyList()
        } else {
            chatMessageRepository.findRecentMessagesWithinMinutes(MAX_HISTORY_MINUTES, safeLimit)
        }

        val response = ChatHistoryResponse(
            messages = messages.map { msg ->
                ChatMessageResponse(
                    id = msg.id!!,
                    memberId = msg.member.id!!,
                    nickname = msg.member.nickname,
                    profileImageUrl = msg.member.profileImageUrl,
                    grade = msg.member.grade.name,
                    content = msg.content,
                    createdAt = msg.createdAt
                )
            },
            hasMore = false  // 30분 제한으로 추가 로드 불필요
        )

        return ApiResponse.success(response)
    }
}
