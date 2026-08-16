package com.bluewings.chat.dto.response

import java.time.Instant

data class ChatMessageResponse(
    val id: Long,
    val memberId: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val grade: String,
    val content: String,
    val createdAt: Instant
)

data class ChatHistoryResponse(
    val messages: List<ChatMessageResponse>,
    val hasMore: Boolean
)

data class ChatBroadcastMessage(
    val type: String, // "MESSAGE", "JOIN", "LEAVE"
    val message: ChatMessageResponse? = null,
    val nickname: String? = null,
    val onlineCount: Int? = null
)
