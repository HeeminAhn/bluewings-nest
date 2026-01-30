package com.bluewings.community.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreatePostRequest(
    @field:NotBlank(message = "제목을 입력해주세요")
    @field:Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요")
    val content: String,

    @field:jakarta.validation.constraints.NotNull(message = "카테고리를 선택해주세요")
    val categoryId: Long,

    val images: List<ImageRequest> = emptyList()
)

data class UpdatePostRequest(
    @field:NotBlank(message = "제목을 입력해주세요")
    @field:Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요")
    val content: String,

    @field:jakarta.validation.constraints.NotNull(message = "카테고리를 선택해주세요")
    val categoryId: Long,

    val images: List<ImageRequest> = emptyList()
)

data class ImageRequest(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)
