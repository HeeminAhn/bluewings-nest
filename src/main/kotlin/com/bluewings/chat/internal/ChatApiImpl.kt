package com.bluewings.chat.internal

import com.bluewings.chat.api.ChatApi
import com.bluewings.chat.dto.response.ChatBroadcastMessage
import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.chat.resource.ChatWebSocket
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

/**
 * ChatApi 구현체
 */
@ApplicationScoped
class ChatApiImpl(
    private val chatMessageRepository: ChatMessageRepository,
    private val objectMapper: ObjectMapper
) : ChatApi {

    override fun kickMember(memberId: Long) {
        ChatWebSocket.kickMember(memberId)
    }

    override fun getOnlineCount(): Int {
        // ChatWebSocket의 connections에 접근하기 어려우므로
        // 별도 구현이 필요할 수 있음
        return 0  // TODO: 실제 구현 필요
    }

    override fun isOnline(memberId: Long): Boolean {
        // TODO: 실제 구현 필요
        return false
    }

    override fun sendSystemMessage(message: String) {
        // TODO: 시스템 메시지 브로드캐스트 구현
    }

    @Transactional
    override fun anonymizeMemberMessages(memberId: Long) {
        // Member 엔티티의 닉네임이 익명화되면 자동으로 반영됨
        // 추가 처리 필요 시 여기에 구현
    }
}
