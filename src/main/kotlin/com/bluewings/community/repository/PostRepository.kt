package com.bluewings.community.repository

import com.bluewings.community.domain.Post
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.EntityManager
import jakarta.inject.Inject
import java.time.LocalDateTime

@ApplicationScoped
class PostRepository : PanacheRepository<Post> {

    @Inject
    lateinit var em: EntityManager

    // N+1 해결: member, category를 함께 로드
    fun findAllPaged(page: Int, size: Int): List<Post> {
        return em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            ORDER BY p.createdAt DESC
            """.trimIndent(),
            Post::class.java
        )
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    // N+1 해결: member, category를 함께 로드
    fun findByMemberIdPaged(memberId: Long, page: Int, size: Int): List<Post> {
        return em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            WHERE p.member.id = :memberId
            ORDER BY p.createdAt DESC
            """.trimIndent(),
            Post::class.java
        )
            .setParameter("memberId", memberId)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    fun countAll(): Long {
        return count()
    }

    fun countByMemberId(memberId: Long): Long {
        return count("member.id", memberId)
    }

    // N+1 해결: member, category를 함께 로드
    fun searchByTitle(keyword: String, page: Int, size: Int): List<Post> {
        return em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            WHERE p.title LIKE :keyword
            ORDER BY p.createdAt DESC
            """.trimIndent(),
            Post::class.java
        )
            .setParameter("keyword", "%$keyword%")
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    fun countByTitleKeyword(keyword: String): Long {
        return count("title like ?1", "%$keyword%")
    }

    // N+1 해결: member, category를 함께 로드
    fun findPopularPosts(startDate: LocalDateTime, limit: Int): List<Post> {
        return em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            WHERE p.createdAt >= :startDate
            ORDER BY p.viewCount DESC, p.likeCount DESC
            """.trimIndent(),
            Post::class.java
        )
            .setParameter("startDate", startDate)
            .setMaxResults(limit)
            .resultList
    }

    // N+1 해결: member, category를 함께 로드
    fun findWithFilters(
        keyword: String?,
        authorNickname: String?,
        categoryId: Long?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        page: Int,
        size: Int
    ): Pair<List<Post>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!keyword.isNullOrBlank()) {
            conditions.add("(p.title LIKE :keyword OR p.content LIKE :keyword)")
            params["keyword"] = "%$keyword%"
        }

        if (!authorNickname.isNullOrBlank()) {
            conditions.add("p.member.nickname LIKE :authorNickname")
            params["authorNickname"] = "%$authorNickname%"
        }

        if (categoryId != null) {
            conditions.add("p.category.id = :categoryId")
            params["categoryId"] = categoryId
        }

        if (startDate != null) {
            conditions.add("p.createdAt >= :startDate")
            params["startDate"] = startDate
        }

        if (endDate != null) {
            conditions.add("p.createdAt < :endDate")
            params["endDate"] = endDate
        }

        val whereClause = if (conditions.isEmpty()) "" else "WHERE ${conditions.joinToString(" AND ")}"

        val query = em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            $whereClause
            ORDER BY p.createdAt DESC
            """.trimIndent(),
            Post::class.java
        )

        params.forEach { (key, value) -> query.setParameter(key, value) }

        val posts = query
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList

        // count 쿼리
        val countQuery = em.createQuery(
            "SELECT COUNT(p) FROM Post p $whereClause",
            Long::class.javaObjectType
        )
        params.forEach { (key, value) -> countQuery.setParameter(key, value) }
        val totalCount = countQuery.singleResult

        return Pair(posts, totalCount)
    }

    // N+1 해결: member, category를 함께 로드
    fun findByCategoryPaged(categoryId: Long, page: Int, size: Int): List<Post> {
        return em.createQuery(
            """
            SELECT DISTINCT p FROM Post p
            LEFT JOIN FETCH p.member
            LEFT JOIN FETCH p.category
            WHERE p.category.id = :categoryId
            ORDER BY p.createdAt DESC
            """.trimIndent(),
            Post::class.java
        )
            .setParameter("categoryId", categoryId)
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    fun countByCategory(categoryId: Long): Long {
        return count("category.id", categoryId)
    }

    // ============ 원자적 카운트 업데이트 ============

    fun incrementViewCount(postId: Long): Int {
        return update("viewCount = viewCount + 1 where id = ?1", postId)
    }

    fun incrementLikeCount(postId: Long): Int {
        return update("likeCount = likeCount + 1 where id = ?1", postId)
    }

    fun decrementLikeCount(postId: Long): Int {
        return update("likeCount = likeCount - 1 where id = ?1 and likeCount > 0", postId)
    }

    fun incrementCommentCount(postId: Long): Int {
        return update("commentCount = commentCount + 1 where id = ?1", postId)
    }

    fun decrementCommentCount(postId: Long): Int {
        return update("commentCount = commentCount - 1 where id = ?1 and commentCount > 0", postId)
    }
}
