package com.bluewings.community.repository

import com.bluewings.community.domain.Comment
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.EntityManager
import jakarta.inject.Inject
import java.time.LocalDateTime

@ApplicationScoped
class CommentRepository : PanacheRepository<Comment> {

    @Inject
    lateinit var em: EntityManager

    // N+1 해결: member, replies, images를 함께 로드
    fun findRootCommentsByPostIdPaged(postId: Long, page: Int, size: Int): List<Comment> {
        return em.createQuery(
            """
            SELECT DISTINCT c FROM Comment c
            LEFT JOIN FETCH c.member
            LEFT JOIN FETCH c.images
            WHERE c.post.id = :postId AND c.parent IS NULL
            ORDER BY c.createdAt ASC
            """.trimIndent(),
            Comment::class.java
        )
            .setParameter("postId", postId)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    // N+1 해결: member를 함께 로드
    fun findByPostIdPaged(postId: Long, page: Int, size: Int): List<Comment> {
        return em.createQuery(
            """
            SELECT DISTINCT c FROM Comment c
            LEFT JOIN FETCH c.member
            LEFT JOIN FETCH c.images
            WHERE c.post.id = :postId
            ORDER BY c.createdAt ASC
            """.trimIndent(),
            Comment::class.java
        )
            .setParameter("postId", postId)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    // N+1 해결: member, post를 함께 로드
    fun findByMemberIdPaged(memberId: Long, page: Int, size: Int): List<Comment> {
        return em.createQuery(
            """
            SELECT DISTINCT c FROM Comment c
            LEFT JOIN FETCH c.member
            LEFT JOIN FETCH c.post
            WHERE c.member.id = :memberId
            ORDER BY c.createdAt DESC
            """.trimIndent(),
            Comment::class.java
        )
            .setParameter("memberId", memberId)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    // 루트 댓글 수만 카운트
    fun countRootCommentsByPostId(postId: Long): Long {
        return count("post.id = ?1 AND parent IS NULL", postId)
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

    // N+1 해결: member, post를 함께 로드
    fun findWithFilters(
        keyword: String?,
        authorNickname: String?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        page: Int,
        size: Int
    ): Pair<List<Comment>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!keyword.isNullOrBlank()) {
            conditions.add("c.content LIKE :keyword")
            params["keyword"] = "%$keyword%"
        }

        if (!authorNickname.isNullOrBlank()) {
            conditions.add("c.member.nickname LIKE :authorNickname")
            params["authorNickname"] = "%$authorNickname%"
        }

        if (startDate != null) {
            conditions.add("c.createdAt >= :startDate")
            params["startDate"] = startDate
        }

        if (endDate != null) {
            conditions.add("c.createdAt < :endDate")
            params["endDate"] = endDate
        }

        val whereClause = if (conditions.isEmpty()) "" else "WHERE ${conditions.joinToString(" AND ")}"

        val query = em.createQuery(
            """
            SELECT DISTINCT c FROM Comment c
            LEFT JOIN FETCH c.member
            LEFT JOIN FETCH c.post
            $whereClause
            ORDER BY c.createdAt DESC
            """.trimIndent(),
            Comment::class.java
        )

        params.forEach { (key, value) -> query.setParameter(key, value) }

        val comments = query
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList

        val countQuery = em.createQuery(
            "SELECT COUNT(c) FROM Comment c $whereClause",
            Long::class.javaObjectType
        )
        params.forEach { (key, value) -> countQuery.setParameter(key, value) }
        val totalCount = countQuery.singleResult

        return Pair(comments, totalCount)
    }
}
