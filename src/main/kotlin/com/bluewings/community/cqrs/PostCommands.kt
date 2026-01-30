package com.bluewings.community.cqrs

// 게시글 명령
data class CreatePostCommand(
    val memberId: Long,
    val title: String,
    val content: String,
    val categoryId: Long? = null,
    val images: List<ImageData> = emptyList()
)

data class UpdatePostCommand(
    val postId: Long,
    val memberId: Long,
    val title: String,
    val content: String,
    val categoryId: Long? = null,
    val images: List<ImageData> = emptyList()
)

data class ImageData(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)

data class DeletePostCommand(
    val postId: Long,
    val memberId: Long
)

data class IncrementViewCountCommand(
    val postId: Long,
    val memberId: Long? = null,
    val ipAddress: String? = null
)

// 좋아요 명령
data class ToggleLikeCommand(
    val postId: Long,
    val memberId: Long
)

// 댓글 명령
data class CreateCommentCommand(
    val postId: Long,
    val memberId: Long,
    val content: String,
    val parentId: Long? = null,
    val images: List<ImageData> = emptyList()
)

data class UpdateCommentCommand(
    val commentId: Long,
    val memberId: Long,
    val content: String,
    val images: List<ImageData> = emptyList()
)

data class DeleteCommentCommand(
    val commentId: Long,
    val memberId: Long
)
