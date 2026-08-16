package com.bluewings.report.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class ReportCommandHandler(
    private val reportRepository: MemberReportRepository,
    private val memberRepository: MemberRepository
) {

    @Transactional
    fun handle(command: CreateReportCommand): Long {
        val reporter = memberRepository.findById(command.reporterId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val reportedMember = memberRepository.findById(command.reportedMemberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (reporter.id == reportedMember.id) {
            throw BusinessException(ErrorCode.CANNOT_REPORT_SELF)
        }

        if (command.contentType != null && command.contentId != null) {
            val alreadyReported = reportRepository.existsByReporterAndContent(
                reporter.id!!,
                command.contentType.name,
                command.contentId
            )
            if (alreadyReported) {
                throw BusinessException(ErrorCode.ALREADY_REPORTED)
            }
        }

        val report = MemberReport(
            reporter = reporter,
            reportedMember = reportedMember,
            reason = command.reason,
            description = command.description,
            contentType = command.contentType,
            contentId = command.contentId
        )

        reportRepository.persist(report)

        return report.id!!
    }
}
