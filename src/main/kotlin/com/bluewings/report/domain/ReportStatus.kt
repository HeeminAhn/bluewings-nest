package com.bluewings.report.domain

enum class ReportStatus(val description: String) {
    PENDING("처리 대기"),
    ACCEPTED("신고 승인"),
    REJECTED("신고 반려"),
    RESOLVED("처리 완료")
}
