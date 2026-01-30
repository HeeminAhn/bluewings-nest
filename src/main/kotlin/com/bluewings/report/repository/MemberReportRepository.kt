package com.bluewings.report.repository

import com.bluewings.report.domain.MemberReport
import com.bluewings.report.domain.ReportStatus
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDateTime

@ApplicationScoped
class MemberReportRepository : PanacheRepository<MemberReport> {

    fun findByStatus(status: ReportStatus, page: Int, size: Int): List<MemberReport> {
        return find("status = ?1 ORDER BY createdAt DESC", status)
            .page(page, size)
            .list()
    }

    fun countByStatus(status: ReportStatus): Long {
        return count("status", status)
    }

    fun findByReportedMemberId(memberId: Long, page: Int, size: Int): List<MemberReport> {
        return find("reportedMember.id = ?1 ORDER BY createdAt DESC", memberId)
            .page(page, size)
            .list()
    }

    fun countByReportedMemberId(memberId: Long): Long {
        return count("reportedMember.id", memberId)
    }

    fun findByReporterId(reporterId: Long, page: Int, size: Int): List<MemberReport> {
        return find("reporter.id = ?1 ORDER BY createdAt DESC", reporterId)
            .page(page, size)
            .list()
    }

    fun existsByReporterAndContent(reporterId: Long, contentType: String, contentId: Long): Boolean {
        return count("reporter.id = ?1 AND contentType = ?2 AND contentId = ?3", reporterId, contentType, contentId) > 0
    }

    fun findAll(page: Int, size: Int): List<MemberReport> {
        return find("ORDER BY createdAt DESC")
            .page(page, size)
            .list()
    }

    fun findPending(page: Int, size: Int): List<MemberReport> {
        return findByStatus(ReportStatus.PENDING, page, size)
    }

    fun countPending(): Long {
        return countByStatus(ReportStatus.PENDING)
    }

    fun findWithFilters(
        status: ReportStatus?,
        startDate: LocalDateTime?,
        endDate: LocalDateTime?,
        page: Int,
        size: Int
    ): Pair<List<MemberReport>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (status != null) {
            conditions.add("status = :status")
            params["status"] = status
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

        val reports = query.page(Page.of(page, size)).list()
        val totalCount = if (conditions.isEmpty()) {
            count()
        } else {
            count(conditions.joinToString(" and "), params)
        }

        return Pair(reports, totalCount)
    }
}
