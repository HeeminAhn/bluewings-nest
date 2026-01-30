package com.bluewings.community.dto.response

import com.bluewings.community.domain.PostImage

data class ImageResponse(
    val id: Long,
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String,
    val displayOrder: Int
) {
    companion object {
        fun from(image: PostImage): ImageResponse {
            return ImageResponse(
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

data class UploadImageResponse(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)
