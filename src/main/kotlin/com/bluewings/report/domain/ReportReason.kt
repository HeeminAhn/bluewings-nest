package com.bluewings.report.domain

enum class ReportReason(val description: String) {
    SPAM("스팸/도배"),
    HARASSMENT("욕설/비방"),
    INAPPROPRIATE("부적절한 콘텐츠"),
    ADVERTISING("광고/홍보"),
    IMPERSONATION("사칭"),
    OTHER("기타")
}
