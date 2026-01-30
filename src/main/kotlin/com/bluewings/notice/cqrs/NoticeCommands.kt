package com.bluewings.notice.cqrs

data class CreateNoticeCommand(
    val memberId: Long,
    val title: String,
    val content: String,
    val isPinned: Boolean = false,
    val images: List<ImageData> = emptyList()
)

data class UpdateNoticeCommand(
    val noticeId: Long,
    val memberId: Long,
    val title: String,
    val content: String,
    val isPinned: Boolean = false,
    val images: List<ImageData> = emptyList()
)

data class DeleteNoticeCommand(
    val noticeId: Long,
    val memberId: Long
)

data class IncrementNoticeViewCountCommand(
    val noticeId: Long
)

data class ImageData(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)
