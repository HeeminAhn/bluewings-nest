package com.bluewings.report.dto

import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.ReportReason
import jakarta.validation.constraints.NotNull

data class CreateReportRequest(
    @field:NotNull(message = "신고 대상 회원 ID는 필수입니다")
    val reportedMemberId: Long,
    @field:NotNull(message = "신고 사유는 필수입니다")
    val reason: ReportReason,
    val description: String?,
    val contentType: ContentType?,
    val contentId: Long?
)
