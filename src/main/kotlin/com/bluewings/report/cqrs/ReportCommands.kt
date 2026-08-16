package com.bluewings.report.cqrs

import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.ReportReason

data class CreateReportCommand(
    val reporterId: Long,
    val reportedMemberId: Long,
    val reason: ReportReason,
    val description: String?,
    val contentType: ContentType?,
    val contentId: Long?
)
