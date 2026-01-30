package com.bluewings.chat.api

import com.bluewings.shared.kernel.BaseDomainEvent

/**
 * 채팅 메시지 전송 이벤트
 */
class ChatMessageSentEvent(
    messageId: Long,
    val senderId: Long,
    val content: String
) : BaseDomainEvent(messageId)

/**
 * 회원 채팅 입장 이벤트
 */
class MemberJoinedChatEvent(
    memberId: Long,
    val nickname: String
) : BaseDomainEvent(memberId)

/**
 * 회원 채팅 퇴장 이벤트
 */
class MemberLeftChatEvent(
    memberId: Long,
    val nickname: String,
    val reason: String? = null  // "kicked", "disconnected", "logout" 등
) : BaseDomainEvent(memberId)
