package com.bluewings.community.dto.response

import com.bluewings.community.domain.Post
import com.bluewings.member.domain.MemberGrade
import java.time.LocalDateTime

data class PostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val author: AuthorInfo,
    val category: CategoryResponse?,
    val images: List<ImageResponse>,
    val isLiked: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(post: Post, isLiked: Boolean = false): PostResponse {
            return PostResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = post.commentCount,
                author = AuthorInfo(
                    id = post.member.id!!,
                    nickname = post.member.nickname,
                    grade = post.member.grade,
                    profileImageUrl = post.member.profileImageUrl
                ),
                category = post.category?.let { CategoryResponse.from(it) },
                images = post.images.map { ImageResponse.from(it) },
                isLiked = isLiked,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt
            )
        }
    }
}

data class PostListResponse(
    val id: Long,
    val title: String,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val author: AuthorInfo,
    val category: CategoryResponse?,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(post: Post): PostListResponse {
            return PostListResponse(
                id = post.id,
                title = post.title,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = post.commentCount,
                author = AuthorInfo(
                    id = post.member.id!!,
                    nickname = post.member.nickname,
                    grade = post.member.grade,
                    profileImageUrl = post.member.profileImageUrl
                ),
                category = post.category?.let { CategoryResponse.from(it) },
                createdAt = post.createdAt
            )
        }
    }
}

data class AuthorInfo(
    val id: Long,
    val nickname: String,
    val grade: MemberGrade,
    val profileImageUrl: String?
)

data class PagedPostResponse(
    val posts: List<PostListResponse>,
    val totalCount: Long,
    val currentPage: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
