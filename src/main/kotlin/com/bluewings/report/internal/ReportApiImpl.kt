package com.bluewings.report.internal

import com.bluewings.report.api.CreateReportRequest
import com.bluewings.report.api.ReportApi
import com.bluewings.report.api.ReportContentType
import com.bluewings.report.cqrs.CreateReportCommand
import com.bluewings.report.cqrs.ReportCommandHandler
import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.ReportReason
import com.bluewings.report.repository.MemberReportRepository
import jakarta.enterprise.context.ApplicationScoped

/**
 * ReportApi 구현체
 */
@ApplicationScoped
class ReportApiImpl(
    private val reportRepository: MemberReportRepository,
    private val commandHandler: ReportCommandHandler
) : ReportApi {

    override fun createReport(request: CreateReportRequest): Long {
        val command = CreateReportCommand(
            reporterId = request.reporterId,
            reportedMemberId = request.targetMemberId,
            reason = ReportReason.valueOf(request.reason),
            description = request.details,
            contentType = request.contentType.toInternal(),
            contentId = request.contentId
        )
        return commandHandler.handle(command)
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
