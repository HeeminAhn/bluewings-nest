package com.bluewings.notice.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateNoticeRequest(
    @field:NotBlank(message = "제목을 입력해주세요")
    @field:Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요")
    val content: String,

    val isPinned: Boolean = false,

    val images: List<ImageRequest> = emptyList()
)

data class UpdateNoticeRequest(
    @field:NotBlank(message = "제목을 입력해주세요")
    @field:Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요")
    val content: String,

    val isPinned: Boolean = false,

    val images: List<ImageRequest> = emptyList()
)

data class ImageRequest(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)
