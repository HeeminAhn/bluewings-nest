package com.bluewings.community.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.community.dto.response.*
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostLikeRepository
import com.bluewings.community.repository.PostRepository
import jakarta.enterprise.context.ApplicationScoped
import kotlin.math.ceil

@ApplicationScoped
class PostQueryHandler(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val postLikeRepository: PostLikeRepository
) {
    fun handle(query: GetPostByIdQuery): PostResponse {
        val post = postRepository.findByIdWithMember(query.postId)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        if (post.isDeleted()) {
            throw BusinessException(ErrorCode.POST_NOT_FOUND)
        }

        val isLiked = query.viewerId?.let {
            postLikeRepository.existsByPostIdAndMemberId(query.postId, it)
        } ?: false

        return PostResponse.from(post, isLiked)
    }

    fun handle(query: GetPostsPagedQuery): PagedPostResponse {
        val (posts, totalCount) = if (query.categoryId != null) {
            val posts = postRepository.findByCategoryPaged(query.categoryId, query.page, query.size)
            val count = postRepository.countByCategory(query.categoryId)
            posts to count
        } else {
            val posts = postRepository.findAllPaged(query.page, query.size)
            val count = postRepository.countAll()
            posts to count
        }
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt()

        return PagedPostResponse(
            posts = posts.map { PostListResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: GetPostsByMemberQuery): PagedPostResponse {
        val posts = postRepository.findByMemberIdPaged(query.memberId, query.page, query.size)
        val totalCount = postRepository.countByMemberId(query.memberId)
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt()

        return PagedPostResponse(
            posts = posts.map { PostListResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: SearchPostsQuery): PagedPostResponse {
        val posts = postRepository.searchByTitle(query.keyword, query.page, query.size)
        val totalCount = postRepository.countByTitleKeyword(query.keyword)
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt()

        return PagedPostResponse(
            posts = posts.map { PostListResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: IsPostLikedQuery): Boolean {
        return postLikeRepository.existsByPostIdAndMemberId(query.postId, query.memberId)
    }

    fun handle(query: GetCommentsByPostQuery): PagedCommentResponse {
        // 루트 댓글만 조회 (대댓글은 replies에 포함됨)
        val comments = commentRepository.findRootCommentsByPostIdPaged(query.postId, query.page, query.size)
        val totalCount = commentRepository.countRootCommentsByPostId(query.postId)
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt().coerceAtLeast(1)

        return PagedCommentResponse(
            comments = comments.map { CommentResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: GetCommentByIdQuery): CommentResponse {
        val comment = commentRepository.findById(query.commentId)
            ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND)
        return CommentResponse.from(comment)
    }

    fun handle(query: GetPopularPostsQuery): List<PostListResponse> {
        val startDate = when (query.period) {
            PopularPeriod.DAILY -> java.time.LocalDate.now().atStartOfDay()
            PopularPeriod.WEEKLY -> java.time.LocalDate.now()
                .with(java.time.DayOfWeek.MONDAY)
                .atStartOfDay()
            PopularPeriod.MONTHLY -> java.time.LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay()
        }
        val posts = postRepository.findPopularPosts(startDate, query.limit)
        return posts.map { PostListResponse.from(it) }
    }
}
