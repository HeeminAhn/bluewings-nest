package com.bluewings.community.internal

import com.bluewings.community.api.CommunityApi
import com.bluewings.community.api.PostInfo
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

/**
 * CommunityApi 구현체
 */
@ApplicationScoped
class CommunityApiImpl(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository
) : CommunityApi {

    override fun postExists(postId: Long): Boolean {
        return postRepository.findById(postId) != null
    }

    override fun getPostInfo(postId: Long): PostInfo? {
        val post = postRepository.findById(postId) ?: return null
        return PostInfo(
            id = post.id,
            title = post.title,
            authorId = post.member.id!!,
            categoryId = post.category?.id ?: 0L,
            viewCount = post.viewCount,
            likeCount = post.likeCount,
            commentCount = post.commentCount
        )
    }

    override fun countPostsByMember(memberId: Long): Long {
        return postRepository.count("author.id = ?1 and isDeleted = false", memberId)
    }

    override fun countCommentsByMember(memberId: Long): Long {
        return commentRepository.count("author.id = ?1 and isDeleted = false", memberId)
    }

    @Transactional
    override fun anonymizeMemberContent(memberId: Long) {
        // Member 엔티티의 닉네임이 익명화되면 JOIN 시 자동 반영
        // 추가 처리가 필요한 경우 여기에 구현
    }
}
