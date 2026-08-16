package com.bluewings.chat.cqrs

import com.bluewings.chat.dto.response.ChatHistoryResponse
import com.bluewings.chat.dto.response.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class ChatQueryHandler(
    private val chatMessageRepository: ChatMessageRepository
) {
    companion object {
        private const val MAX_HISTORY_MINUTES = 30L
    }

    fun handle(query: GetChatHistoryQuery): ChatHistoryResponse {
        // 초기 로드: 최근 30분 이내. 추가 로드(beforeId 있음)는 30분 제한으로 비활성화.
        val messages = if (query.beforeId != null) {
            emptyList()
        } else {
            chatMessageRepository.findRecentMessagesWithinMinutes(MAX_HISTORY_MINUTES, query.limit)
        }

        return ChatHistoryResponse(
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
            hasMore = false
        )
    }
}
