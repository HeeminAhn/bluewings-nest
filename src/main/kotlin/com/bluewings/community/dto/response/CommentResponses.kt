package com.bluewings.community.dto.response

import com.bluewings.community.domain.Comment
import com.bluewings.community.domain.CommentImage
import java.time.LocalDateTime

data class CommentResponse(
    val id: Long,
    val content: String,
    val author: AuthorInfo,
    val parentId: Long?,
    val replies: List<CommentResponse>,
    val replyCount: Int,
    val images: List<CommentImageResponse>,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: Comment, includeReplies: Boolean = true): CommentResponse {
            return CommentResponse(
                id = comment.id,
                content = comment.content,
                author = AuthorInfo(
                    id = comment.member.id!!,
                    nickname = comment.member.nickname,
                    grade = comment.member.grade,
                    profileImageUrl = comment.member.profileImageUrl
                ),
                parentId = comment.parent?.id,
                replies = if (includeReplies) comment.replies.map { from(it, false) } else emptyList(),
                replyCount = comment.replies.size,
                images = comment.images.map { CommentImageResponse.from(it) },
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}

data class CommentImageResponse(
    val id: Long,
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String,
    val displayOrder: Int
) {
    companion object {
        fun from(image: CommentImage): CommentImageResponse {
            return CommentImageResponse(
                id = image.id,
                fileName = image.fileName,
                originalName = image.originalName,
                filePath = image.filePath,
                fileSize = image.fileSize,
                contentType = image.contentType,
                displayOrder = image.displayOrder
            )
        }
    }
}

data class PagedCommentResponse(
    val comments: List<CommentResponse>,
    val totalCount: Long,
    val currentPage: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
