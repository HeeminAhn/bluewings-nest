package com.bluewings.community.dto.request

import jakarta.validation.constraints.NotBlank

data class CreateCommentRequest(
    @field:NotBlank(message = "댓글 내용을 입력해주세요")
    val content: String,
    val parentId: Long? = null,
    val images: List<CommentImageRequest> = emptyList()
)

data class UpdateCommentRequest(
    @field:NotBlank(message = "댓글 내용을 입력해주세요")
    val content: String,
    val images: List<CommentImageRequest> = emptyList()
)

data class CommentImageRequest(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)
