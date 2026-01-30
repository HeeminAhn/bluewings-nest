package com.bluewings.notice.dto.response

import com.bluewings.member.domain.MemberGrade
import com.bluewings.notice.domain.Notice
import com.bluewings.notice.domain.NoticeImage
import java.time.LocalDateTime

data class NoticeResponse(
    val id: Long,
    val title: String,
    val content: String,
    val viewCount: Int,
    val isPinned: Boolean,
    val author: NoticeAuthorInfo,
    val images: List<NoticeImageResponse>,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(notice: Notice): NoticeResponse {
            return NoticeResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                viewCount = notice.viewCount,
                isPinned = notice.isPinned,
                author = NoticeAuthorInfo(
                    id = notice.member.id!!,
                    nickname = notice.member.nickname,
                    grade = notice.member.grade,
                    profileImageUrl = notice.member.profileImageUrl
                ),
                images = notice.images.map { NoticeImageResponse.from(it) },
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt
            )
        }
    }
}

data class NoticeListResponse(
    val id: Long,
    val title: String,
    val viewCount: Int,
    val isPinned: Boolean,
    val author: NoticeAuthorInfo,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(notice: Notice): NoticeListResponse {
            return NoticeListResponse(
                id = notice.id,
                title = notice.title,
                viewCount = notice.viewCount,
                isPinned = notice.isPinned,
                author = NoticeAuthorInfo(
                    id = notice.member.id!!,
                    nickname = notice.member.nickname,
                    grade = notice.member.grade,
                    profileImageUrl = notice.member.profileImageUrl
                ),
                createdAt = notice.createdAt
            )
        }
    }
}

data class NoticeAuthorInfo(
    val id: Long,
    val nickname: String,
    val grade: MemberGrade,
    val profileImageUrl: String?
)

data class NoticeImageResponse(
    val id: Long,
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String,
    val displayOrder: Int
) {
    companion object {
        fun from(image: NoticeImage): NoticeImageResponse {
            return NoticeImageResponse(
                id = image.id,
                fileName = image.fileName,
                originalName = image.originalName,
                filePath = image.filePath,
                fileSize = image.fileSize,
                contentType = image.contentType,
                displayOrder = image.displayOrder
            )
        }
    }
}

data class PagedNoticeResponse(
    val notices: List<NoticeListResponse>,
    val totalCount: Long,
    val currentPage: Int,
    val totalPages: Int,
    val hasNext: Boolean,
    val hasPrevious: Boolean
)
