package com.bluewings.chat.dto

import java.time.Instant

// WebSocket 메시지 타입
data class ChatMessageRequest(
    val content: String
)

data class ChatMessageResponse(
    val id: Long,
    val memberId: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val grade: String,
    val content: String,
    val createdAt: Instant
)

// REST API 응답
data class ChatHistoryResponse(
    val messages: List<ChatMessageResponse>,
    val hasMore: Boolean
)

// WebSocket 브로드캐스트 메시지
data class ChatBroadcastMessage(
    val type: String, // "MESSAGE", "JOIN", "LEAVE"
    val message: ChatMessageResponse? = null,
    val nickname: String? = null,
    val onlineCount: Int? = null
)
