package com.bluewings.report.domain

enum class ContentType(val description: String) {
    POST("게시글"),
    COMMENT("댓글"),
    CHAT("채팅"),
    PROFILE("프로필")
}
