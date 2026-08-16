package com.bluewings.chat.cqrs

data class GetChatHistoryQuery(
    val beforeId: Long? = null,
    val limit: Int = 100
)
