package com.bluewings.community.repository

import com.bluewings.community.domain.PostLike
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class PostLikeRepository : PanacheRepository<PostLike> {

    fun findByPostIdAndMemberId(postId: Long, memberId: Long): PostLike? {
        return find("post.id = ?1 and member.id = ?2", postId, memberId).firstResult()
    }

    fun existsByPostIdAndMemberId(postId: Long, memberId: Long): Boolean {
        return count("post.id = ?1 and member.id = ?2", postId, memberId) > 0
    }

    fun deleteByPostIdAndMemberId(postId: Long, memberId: Long): Long {
        return delete("post.id = ?1 and member.id = ?2", postId, memberId)
    }

    fun countByPostId(postId: Long): Long {
        return count("post.id", postId)
    }

    fun countByMemberId(memberId: Long): Long {
        return count("member.id", memberId)
    }

    fun deleteByPostId(postId: Long): Long {
        return delete("post.id", postId)
    }
}
