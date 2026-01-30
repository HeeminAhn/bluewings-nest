package com.bluewings.notice.api

/**
 * Notice 모듈의 공개 API
 */
interface NoticeApi {
    /**
     * 공지사항 존재 여부 확인
     */
    fun noticeExists(noticeId: Long): Boolean

    /**
     * 공지사항 정보 조회
     */
    fun getNoticeInfo(noticeId: Long): NoticeInfo?

    /**
     * 고정 공지사항 개수 조회
     */
    fun countPinnedNotices(): Long
}

/**
 * 다른 모듈에 노출되는 공지사항 정보 DTO
 */
data class NoticeInfo(
    val id: Long,
    val title: String,
    val authorId: Long,
    val isPinned: Boolean,
    val viewCount: Int
)
