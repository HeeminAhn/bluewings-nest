package com.bluewings.community.dto.response

data class LikeResponse(
    val postId: Long,
    val isLiked: Boolean,
    val likeCount: Int
)
