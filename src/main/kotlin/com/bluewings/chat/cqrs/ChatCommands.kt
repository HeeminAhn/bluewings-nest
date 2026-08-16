package com.bluewings.chat.cqrs

import com.bluewings.chat.dto.response.ChatMessageResponse

data class SendMessageCommand(
    val memberId: Long,
    val content: String
)

enum class SendMessageResult {
    SUCCESS, MEMBER_BLOCKED, MEMBER_NOT_FOUND, INVALID_CONTENT
}

data class SendMessageOutcome(
    val result: SendMessageResult,
    val response: ChatMessageResponse? = null
)
