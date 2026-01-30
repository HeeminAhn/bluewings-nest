package com.bluewings.notice.repository

import com.bluewings.notice.domain.Notice
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.EntityManager
import jakarta.inject.Inject
import java.time.LocalDateTime

@ApplicationScoped
class NoticeRepository : PanacheRepository<Notice> {

    @Inject
    lateinit var em: EntityManager

    // N+1 해결: member를 함께 로드
    fun findAllPaged(page: Int, size: Int): List<Notice> {
        return em.createQuery(
            """
            SELECT DISTINCT n FROM Notice n
            LEFT JOIN FETCH n.member
            ORDER BY n.isPinned DESC, n.createdAt DESC
            """.trimIndent(),
            Notice::class.java
        )
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    // N+1 해결: member를 함께 로드
    fun findPinnedNotices(): List<Notice> {
        return em.createQuery(
            """
            SELECT DISTINCT n FROM Notice n
            LEFT JOIN FETCH n.member
            WHERE n.isPinned = true
            ORDER BY n.createdAt DESC
            """.trimIndent(),
            Notice::class.java
        ).resultList
    }

    // N+1 해결: member를 함께 로드
    fun searchByTitle(keyword: String, page: Int, size: Int): List<Notice> {
        return em.createQuery(
            """
            SELECT DISTINCT n FROM Notice n
            LEFT JOIN FETCH n.member
            WHERE n.title LIKE :keyword
            ORDER BY n.isPinned DESC, n.createdAt DESC
            """.trimIndent(),
            Notice::class.java
        )
            .setParameter("keyword", "%$keyword%")
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList
    }

    fun countByTitleKeyword(keyword: String): Long {
        return count("title like ?1", "%$keyword%")
    }

    fun countAll(): Long {
        return count()
    }

    // N+1 해결: member를 함께 로드
    fun findWithFilters(
        keyword: String?,
        authorNickname: String?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        page: Int,
        size: Int
    ): Pair<List<Notice>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!keyword.isNullOrBlank()) {
            conditions.add("(n.title LIKE :keyword OR n.content LIKE :keyword)")
            params["keyword"] = "%$keyword%"
        }

        if (!authorNickname.isNullOrBlank()) {
            conditions.add("n.member.nickname LIKE :authorNickname")
            params["authorNickname"] = "%$authorNickname%"
        }

        if (startDate != null) {
            conditions.add("n.createdAt >= :startDate")
            params["startDate"] = startDate
        }

        if (endDate != null) {
            conditions.add("n.createdAt < :endDate")
            params["endDate"] = endDate
        }

        val whereClause = if (conditions.isEmpty()) "" else "WHERE ${conditions.joinToString(" AND ")}"

        val query = em.createQuery(
            """
            SELECT DISTINCT n FROM Notice n
            LEFT JOIN FETCH n.member
            $whereClause
            ORDER BY n.isPinned DESC, n.createdAt DESC
            """.trimIndent(),
            Notice::class.java
        )

        params.forEach { (key, value) -> query.setParameter(key, value) }

        val notices = query
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList

        val countQuery = em.createQuery(
            "SELECT COUNT(n) FROM Notice n $whereClause",
            Long::class.javaObjectType
        )
        params.forEach { (key, value) -> countQuery.setParameter(key, value) }
        val totalCount = countQuery.singleResult

        return Pair(notices, totalCount)
    }
}
