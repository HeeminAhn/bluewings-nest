package com.bluewings.chat.internal

import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.chat.resource.ChatWebSocket
import com.bluewings.member.api.MemberBlockedEvent
import com.bluewings.member.api.MemberWithdrawnEvent
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.event.Observes
import jakarta.transaction.Transactional
import org.jboss.logging.Logger

/**
 * Chat 모듈에서 Member 이벤트를 처리하는 핸들러
 */
@ApplicationScoped
class MemberEventHandler(
    private val chatMessageRepository: ChatMessageRepository
) {
    private val log = Logger.getLogger(MemberEventHandler::class.java)

    /**
     * 회원 탈퇴 시 채팅에서 퇴장 처리
     */
    @Transactional
    fun onMemberWithdrawn(@Observes event: MemberWithdrawnEvent) {
        log.info("Handling MemberWithdrawnEvent in Chat module for memberId: ${event.aggregateId}")
        ChatWebSocket.kickMember(event.aggregateId)
        // 메시지 익명화는 Member 엔티티 닉네임이 변경되면 자동 반영
    }

    /**
     * 회원 차단 시 채팅에서 강제 퇴장
     */
    fun onMemberBlocked(@Observes event: MemberBlockedEvent) {
        log.info("Handling MemberBlockedEvent in Chat module for memberId: ${event.aggregateId}")
        ChatWebSocket.kickMember(event.aggregateId)
    }
}
