package com.bluewings.community.repository

import com.bluewings.community.domain.PostView
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDateTime

@ApplicationScoped
class PostViewRepository : PanacheRepository<PostView> {

    /**
     * 특정 게시글의 조회수 (실제 레코드 수)
     */
    fun countByPostId(postId: Long): Long {
        return count("post.id", postId)
    }

    /**
     * 특정 회원이 특정 게시글을 조회한 이력이 있는지 (전체 기간)
     */
    fun existsByPostIdAndMemberId(postId: Long, memberId: Long): Boolean {
        return count("post.id = ?1 and member.id = ?2", postId, memberId) > 0
    }

    /**
     * 특정 IP가 특정 게시글을 조회한 이력이 있는지 (특정 시간 이후)
     */
    fun existsByPostIdAndIpAddressAfter(postId: Long, ipAddress: String, after: LocalDateTime): Boolean {
        return count("post.id = ?1 and ipAddress = ?2 and createdAt > ?3", postId, ipAddress, after) > 0
    }

    /**
     * 특정 게시글의 조회 이력 삭제
     */
    fun deleteByPostId(postId: Long): Long {
        return delete("post.id", postId)
    }
}
