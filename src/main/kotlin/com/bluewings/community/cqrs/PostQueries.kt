package com.bluewings.community.cqrs

// 게시글 조회
data class GetPostByIdQuery(
    val postId: Long,
    val viewerId: Long? = null
)

data class GetPostsPagedQuery(
    val categoryId: Long? = null,
    val page: Int = 0,
    val size: Int = 20
)

data class GetPostsByMemberQuery(
    val memberId: Long,
    val page: Int = 0,
    val size: Int = 20
)

data class SearchPostsQuery(
    val keyword: String,
    val page: Int = 0,
    val size: Int = 20
)

// 좋아요 조회
data class IsPostLikedQuery(
    val postId: Long,
    val memberId: Long
)

// 댓글 조회
data class GetCommentsByPostQuery(
    val postId: Long,
    val page: Int = 0,
    val size: Int = 20
)

data class GetCommentByIdQuery(
    val commentId: Long
)

// 인기글 조회
data class GetPopularPostsQuery(
    val period: PopularPeriod,
    val limit: Int = 5
)

enum class PopularPeriod {
    DAILY,   // 오늘
    WEEKLY,  // 이번 주 (월요일부터)
    MONTHLY  // 이번 달 (1일부터)
}
