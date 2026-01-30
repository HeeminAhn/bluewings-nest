package com.bluewings.member.repository

import com.bluewings.member.domain.MemberAccessLog
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import java.time.Instant

@ApplicationScoped
class MemberAccessLogRepository : PanacheRepository<MemberAccessLog> {

    fun findByMemberId(memberId: Long, page: Int, size: Int): List<MemberAccessLog> {
        return find("member.id = ?1 ORDER BY createdAt DESC", memberId)
            .page(page, size)
            .list()
    }

    fun countByMemberId(memberId: Long): Long {
        return count("member.id", memberId)
    }

    fun findRecentFailedAttempts(email: String, since: Instant): List<MemberAccessLog> {
        return find("email = ?1 AND isSuccess = false AND createdAt > ?2 ORDER BY createdAt DESC", email, since)
            .list()
    }

    fun countRecentFailedAttempts(ipAddress: String, since: Instant): Long {
        return count("ipAddress = ?1 AND isSuccess = false AND createdAt > ?2", ipAddress, since)
    }

    fun findByIpAddress(ipAddress: String, page: Int, size: Int): List<MemberAccessLog> {
        return find("ipAddress = ?1 ORDER BY createdAt DESC", ipAddress)
            .page(page, size)
            .list()
    }

    fun findAll(page: Int, size: Int): List<MemberAccessLog> {
        return find("ORDER BY createdAt DESC")
            .page(page, size)
            .list()
    }

    fun findWithFilters(
        email: String?,
        ipAddress: String?,
        isSuccess: Boolean?,
        startDate: Instant?,
        endDate: Instant?,
        page: Int,
        size: Int
    ): Pair<List<MemberAccessLog>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!email.isNullOrBlank()) {
            conditions.add("email like :email")
            params["email"] = "%$email%"
        }

        if (!ipAddress.isNullOrBlank()) {
            conditions.add("ipAddress like :ipAddress")
            params["ipAddress"] = "%$ipAddress%"
        }

        if (isSuccess != null) {
            conditions.add("isSuccess = :isSuccess")
            params["isSuccess"] = isSuccess
        }

        if (startDate != null) {
            conditions.add("createdAt >= :startDate")
            params["startDate"] = startDate
        }

        if (endDate != null) {
            conditions.add("createdAt < :endDate")
            params["endDate"] = endDate
        }

        val query = if (conditions.isEmpty()) {
            findAll(Sort.by("createdAt").descending())
        } else {
            find(conditions.joinToString(" and "), Sort.by("createdAt").descending(), params)
        }

        val logs = query.page(Page.of(page, size)).list()
        val totalCount = if (conditions.isEmpty()) {
            count()
        } else {
            count(conditions.joinToString(" and "), params)
        }

        return Pair(logs, totalCount)
    }
}
