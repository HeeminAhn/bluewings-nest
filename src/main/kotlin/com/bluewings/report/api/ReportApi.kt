package com.bluewings.report.api

/**
 * Report 모듈의 공개 API
 */
interface ReportApi {
    /**
     * 신고 생성
     */
    fun createReport(request: CreateReportRequest): Long

    /**
     * 회원의 누적 신고 횟수 조회
     */
    fun countReportsByMember(memberId: Long): Long

    /**
     * 특정 콘텐츠에 대한 신고 수 조회
     */
    fun countReportsForContent(contentType: ReportContentType, contentId: Long): Long
}

data class CreateReportRequest(
    val reporterId: Long,
    val targetMemberId: Long,
    val contentType: ReportContentType,
    val contentId: Long,
    val reason: String,
    val details: String?
)

enum class ReportContentType {
    POST, COMMENT, CHAT_MESSAGE, MEMBER
}
