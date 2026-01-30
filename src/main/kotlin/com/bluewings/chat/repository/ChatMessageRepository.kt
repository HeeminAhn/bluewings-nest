package com.bluewings.chat.repository

import com.bluewings.chat.domain.ChatMessage
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import jakarta.persistence.EntityManager
import jakarta.inject.Inject
import java.time.Instant
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@ApplicationScoped
class ChatMessageRepository : PanacheRepository<ChatMessage> {

    @Inject
    lateinit var em: EntityManager

    // N+1 해결: member를 함께 로드
    fun findRecentMessages(limit: Int): List<ChatMessage> {
        return em.createQuery(
            """
            SELECT m FROM ChatMessage m
            JOIN FETCH m.member
            ORDER BY m.createdAt DESC
            """.trimIndent(),
            ChatMessage::class.java
        )
            .setMaxResults(limit)
            .resultList
            .reversed()
    }

    // N+1 해결: member를 함께 로드
    fun findRecentMessagesWithinMinutes(minutes: Long, limit: Int): List<ChatMessage> {
        val cutoffTime = Instant.now().minus(minutes, ChronoUnit.MINUTES)
        return em.createQuery(
            """
            SELECT m FROM ChatMessage m
            JOIN FETCH m.member
            WHERE m.createdAt >= :cutoffTime
            ORDER BY m.createdAt DESC
            """.trimIndent(),
            ChatMessage::class.java
        )
            .setParameter("cutoffTime", cutoffTime)
            .setMaxResults(limit)
            .resultList
            .reversed()
    }

    // N+1 해결: member를 함께 로드
    fun findMessagesBeforeId(beforeId: Long, limit: Int): List<ChatMessage> {
        return em.createQuery(
            """
            SELECT m FROM ChatMessage m
            JOIN FETCH m.member
            WHERE m.id < :beforeId
            ORDER BY m.createdAt DESC
            """.trimIndent(),
            ChatMessage::class.java
        )
            .setParameter("beforeId", beforeId)
            .setMaxResults(limit)
            .resultList
            .reversed()
    }

    // N+1 해결: member를 함께 로드
    fun findWithFilters(
        keyword: String?,
        authorNickname: String?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        page: Int,
        size: Int
    ): Pair<List<ChatMessage>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!keyword.isNullOrBlank()) {
            conditions.add("m.content LIKE :keyword")
            params["keyword"] = "%$keyword%"
        }

        if (!authorNickname.isNullOrBlank()) {
            conditions.add("m.member.nickname LIKE :authorNickname")
            params["authorNickname"] = "%$authorNickname%"
        }

        if (startDate != null) {
            conditions.add("m.createdAt >= :startDate")
            params["startDate"] = startDate
        }

        if (endDate != null) {
            conditions.add("m.createdAt < :endDate")
            params["endDate"] = endDate
        }

        val whereClause = if (conditions.isEmpty()) "" else "WHERE ${conditions.joinToString(" AND ")}"

        val query = em.createQuery(
            """
            SELECT m FROM ChatMessage m
            JOIN FETCH m.member
            $whereClause
            ORDER BY m.createdAt DESC
            """.trimIndent(),
            ChatMessage::class.java
        )

        params.forEach { (key, value) -> query.setParameter(key, value) }

        val messages = query
            .setFirstResult(page * size)
            .setMaxResults(size)
            .resultList

        val countQuery = em.createQuery(
            "SELECT COUNT(m) FROM ChatMessage m $whereClause",
            Long::class.javaObjectType
        )
        params.forEach { (key, value) -> countQuery.setParameter(key, value) }
        val totalCount = countQuery.singleResult

        return Pair(messages, totalCount)
    }
}
