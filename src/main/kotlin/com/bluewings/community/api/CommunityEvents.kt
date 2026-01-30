package com.bluewings.community.api

import com.bluewings.shared.kernel.BaseDomainEvent

/**
 * 게시글 작성 이벤트
 */
class PostCreatedEvent(
    postId: Long,
    val authorId: Long,
    val title: String,
    val categoryId: Long
) : BaseDomainEvent(postId)

/**
 * 게시글 삭제 이벤트
 */
class PostDeletedEvent(
    postId: Long,
    val authorId: Long
) : BaseDomainEvent(postId)

/**
 * 댓글 작성 이벤트
 */
class CommentCreatedEvent(
    commentId: Long,
    val postId: Long,
    val authorId: Long,
    val content: String
) : BaseDomainEvent(commentId)

/**
 * 댓글 삭제 이벤트
 */
class CommentDeletedEvent(
    commentId: Long,
    val postId: Long,
    val authorId: Long
) : BaseDomainEvent(commentId)

/**
 * 좋아요 토글 이벤트
 */
class PostLikeToggledEvent(
    postId: Long,
    val memberId: Long,
    val isLiked: Boolean,
    val totalLikeCount: Int
) : BaseDomainEvent(postId)
