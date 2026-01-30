package com.bluewings.report.internal

import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.api.CreateReportRequest
import com.bluewings.report.api.ReportApi
import com.bluewings.report.api.ReportContentType
import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.domain.ReportReason
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

/**
 * ReportApi 구현체
 */
@ApplicationScoped
class ReportApiImpl(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) : ReportApi {

    @Transactional
    override fun createReport(request: CreateReportRequest): Long {
        val reporter = memberRepository.findById(request.reporterId)
            ?: throw IllegalArgumentException("Reporter not found")
        val targetMember = memberRepository.findById(request.targetMemberId)
            ?: throw IllegalArgumentException("Target member not found")

        val report = MemberReport(
            reporter = reporter,
            reportedMember = targetMember,
            reason = ReportReason.valueOf(request.reason),
            description = request.details,
            contentType = request.contentType.toInternal(),
            contentId = request.contentId
        )
        reportRepository.persist(report)
        return report.id!!
    }

    override fun countReportsByMember(memberId: Long): Long {
        return reportRepository.count("reportedMember.id = ?1", memberId)
    }

    override fun countReportsForContent(contentType: ReportContentType, contentId: Long): Long {
        return reportRepository.count(
            "contentType = ?1 and contentId = ?2",
            contentType.toInternal(), contentId
        )
    }

    private fun ReportContentType.toInternal(): ContentType {
        return when (this) {
            ReportContentType.POST -> ContentType.POST
            ReportContentType.COMMENT -> ContentType.COMMENT
            ReportContentType.CHAT_MESSAGE -> ContentType.CHAT
            ReportContentType.MEMBER -> ContentType.PROFILE
        }
    }
}
