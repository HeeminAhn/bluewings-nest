package com.bluewings.community.api

/**
 * Community 모듈의 공개 API
 */
interface CommunityApi {
    /**
     * 게시글 존재 여부 확인
     */
    fun postExists(postId: Long): Boolean

    /**
     * 게시글 정보 조회
     */
    fun getPostInfo(postId: Long): PostInfo?

    /**
     * 회원의 게시글 수 조회
     */
    fun countPostsByMember(memberId: Long): Long

    /**
     * 회원의 댓글 수 조회
     */
    fun countCommentsByMember(memberId: Long): Long

    /**
     * 회원 탈퇴 시 콘텐츠 익명화
     */
    fun anonymizeMemberContent(memberId: Long)
}

/**
 * 다른 모듈에 노출되는 게시글 정보 DTO
 */
data class PostInfo(
    val id: Long,
    val title: String,
    val authorId: Long,
    val categoryId: Long,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int
)
