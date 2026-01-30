package com.bluewings.notice.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.notice.dto.response.NoticeListResponse
import com.bluewings.notice.dto.response.NoticeResponse
import com.bluewings.notice.dto.response.PagedNoticeResponse
import com.bluewings.notice.repository.NoticeRepository
import jakarta.enterprise.context.ApplicationScoped
import kotlin.math.ceil

@ApplicationScoped
class NoticeQueryHandler(
    private val noticeRepository: NoticeRepository
) {
    fun handle(query: GetNoticeByIdQuery): NoticeResponse {
        val notice = noticeRepository.findById(query.noticeId)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)
        return NoticeResponse.from(notice)
    }

    fun handle(query: GetNoticesPagedQuery): PagedNoticeResponse {
        val notices = noticeRepository.findAllPaged(query.page, query.size)
        val totalCount = noticeRepository.countAll()
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt()

        return PagedNoticeResponse(
            notices = notices.map { NoticeListResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: SearchNoticesQuery): PagedNoticeResponse {
        val notices = noticeRepository.searchByTitle(query.keyword, query.page, query.size)
        val totalCount = noticeRepository.countByTitleKeyword(query.keyword)
        val totalPages = ceil(totalCount.toDouble() / query.size).toInt()

        return PagedNoticeResponse(
            notices = notices.map { NoticeListResponse.from(it) },
            totalCount = totalCount,
            currentPage = query.page,
            totalPages = totalPages,
            hasNext = query.page < totalPages - 1,
            hasPrevious = query.page > 0
        )
    }

    fun handle(query: GetPinnedNoticesQuery): List<NoticeListResponse> {
        return noticeRepository.findPinnedNotices().map { NoticeListResponse.from(it) }
    }
}
