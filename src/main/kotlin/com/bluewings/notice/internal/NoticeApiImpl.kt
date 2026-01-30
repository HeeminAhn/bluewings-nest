package com.bluewings.notice.internal

import com.bluewings.notice.api.NoticeApi
import com.bluewings.notice.api.NoticeInfo
import com.bluewings.notice.repository.NoticeRepository
import jakarta.enterprise.context.ApplicationScoped

/**
 * NoticeApi 구현체
 */
@ApplicationScoped
class NoticeApiImpl(
    private val noticeRepository: NoticeRepository
) : NoticeApi {

    override fun noticeExists(noticeId: Long): Boolean {
        return noticeRepository.findById(noticeId) != null
    }

    override fun getNoticeInfo(noticeId: Long): NoticeInfo? {
        val notice = noticeRepository.findById(noticeId) ?: return null
        return NoticeInfo(
            id = notice.id,
            title = notice.title,
            authorId = notice.member.id!!,
            isPinned = notice.isPinned,
            viewCount = notice.viewCount
        )
    }

    override fun countPinnedNotices(): Long {
        return noticeRepository.count("isPinned = true and isDeleted = false")
    }
}
