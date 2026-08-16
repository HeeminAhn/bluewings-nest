package com.bluewings.report.service

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.dto.CreateReportRequest
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class ReportService(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) {

    @Transactional
    fun createReport(reporterEmail: String, request: CreateReportRequest): Long {
        val reporter = memberRepository.findByEmail(reporterEmail)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val reportedMember = memberRepository.findById(request.reportedMemberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (reporter.id == reportedMember.id) {
            throw BusinessException(ErrorCode.CANNOT_REPORT_SELF)
        }

        if (request.contentType != null && request.contentId != null) {
            val alreadyReported = reportRepository.existsByReporterAndContent(
                reporter.id!!,
                request.contentType.name,
                request.contentId
            )
            if (alreadyReported) {
                throw BusinessException(ErrorCode.ALREADY_REPORTED)
            }
        }

        val report = MemberReport(
            reporter = reporter,
            reportedMember = reportedMember,
            reason = request.reason,
            description = request.description,
            contentType = request.contentType,
            contentId = request.contentId
        )

        reportRepository.persist(report)

        return report.id!!
    }
}
