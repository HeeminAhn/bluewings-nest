package com.bluewings.common.service

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import jakarta.enterprise.context.ApplicationScoped
import net.coobird.thumbnailator.Thumbnails
import org.eclipse.microprofile.config.inject.ConfigProperty
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.UUID
import javax.imageio.ImageIO

data class UploadedFile(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)

@ApplicationScoped
class FileUploadService {

    @ConfigProperty(name = "app.upload.path", defaultValue = "./uploads")
    lateinit var uploadPath: String

    @ConfigProperty(name = "app.upload.max-size", defaultValue = "10485760") // 10MB
    var maxFileSize: Long = 10485760

    @ConfigProperty(name = "app.upload.image.max-dimension", defaultValue = "1920")
    var maxImageDimension: Int = 1920

    @ConfigProperty(name = "app.upload.image.quality", defaultValue = "0.85")
    var imageQuality: Double = 0.85

    private val allowedContentTypes = setOf(
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    )

    private val allowedExtensions = setOf("jpg", "jpeg", "png", "gif", "webp")

    fun uploadImage(
        inputStream: InputStream,
        originalFileName: String,
        contentType: String,
        fileSize: Long,
        subDirectory: String = "posts"
    ): UploadedFile {
        // 파일 크기 검증
        if (fileSize > maxFileSize) {
            throw BusinessException(ErrorCode.FILE_TOO_LARGE, "파일 크기는 10MB를 초과할 수 없습니다")
        }

        // 콘텐츠 타입 검증
        if (contentType !in allowedContentTypes) {
            throw BusinessException(ErrorCode.INVALID_FILE_TYPE, "지원하지 않는 파일 형식입니다 (JPG, PNG, GIF, WEBP만 허용)")
        }

        // 확장자 검증
        val extension = originalFileName.substringAfterLast('.', "").lowercase()
        if (extension !in allowedExtensions) {
            throw BusinessException(ErrorCode.INVALID_FILE_TYPE, "지원하지 않는 파일 확장자입니다")
        }

        // 이미지 바이트 읽기
        val originalBytes = inputStream.readBytes()

        // 이미지 압축/리사이징 (GIF는 애니메이션 때문에 제외)
        val (processedBytes, outputExtension) = if (extension == "gif") {
            Pair(originalBytes, extension)
        } else {
            processImage(originalBytes, extension)
        }

        // 고유 파일명 생성
        val uniqueFileName = "${UUID.randomUUID()}.${outputExtension}"

        // 저장 경로 생성
        val targetDir = Paths.get(uploadPath, subDirectory)
        Files.createDirectories(targetDir)

        val targetPath = targetDir.resolve(uniqueFileName)

        // 파일 저장
        Files.copy(ByteArrayInputStream(processedBytes), targetPath, StandardCopyOption.REPLACE_EXISTING)

        val outputContentType = when (outputExtension) {
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "gif" -> "image/gif"
            "webp" -> "image/webp"
            else -> contentType
        }

        return UploadedFile(
            fileName = uniqueFileName,
            originalName = originalFileName,
            filePath = "/$subDirectory/$uniqueFileName",
            fileSize = processedBytes.size.toLong(),
            contentType = outputContentType
        )
    }

    /**
     * 이미지 압축 및 리사이징
     * - 최대 크기를 초과하면 리사이징
     * - JPEG 품질 압축 적용
     * - PNG는 JPEG로 변환하여 용량 감소 (투명 배경이 없는 경우)
     */
    private fun processImage(imageBytes: ByteArray, extension: String): Pair<ByteArray, String> {
        try {
            val inputImage = ImageIO.read(ByteArrayInputStream(imageBytes))
                ?: return Pair(imageBytes, extension) // 이미지 읽기 실패 시 원본 반환

            val width = inputImage.width
            val height = inputImage.height

            // 리사이징 필요 여부 확인
            val needsResize = width > maxImageDimension || height > maxImageDimension

            // 작은 이미지는 리사이징 없이 품질 압축만 적용
            val outputStream = ByteArrayOutputStream()

            // PNG -> JPEG 변환 (투명도가 없는 경우 용량 절약)
            val outputFormat = if (extension == "png" && !hasTransparency(inputImage)) {
                "jpg"
            } else if (extension == "webp") {
                // WebP는 그대로 유지 (Thumbnailator가 webp 쓰기를 지원하지 않을 수 있음)
                return Pair(imageBytes, extension)
            } else {
                extension
            }

            val builder = Thumbnails.of(inputImage)

            if (needsResize) {
                // 비율 유지하면서 최대 크기로 리사이징
                builder.size(maxImageDimension, maxImageDimension)
            } else {
                // 원본 크기 유지
                builder.scale(1.0)
            }

            // JPEG 품질 설정
            if (outputFormat == "jpg" || outputFormat == "jpeg") {
                builder.outputQuality(imageQuality)
            }

            builder.outputFormat(outputFormat)
                .toOutputStream(outputStream)

            val resultBytes = outputStream.toByteArray()

            // 압축 후 오히려 커지면 원본 반환 (작은 이미지의 경우)
            return if (resultBytes.size < imageBytes.size) {
                Pair(resultBytes, if (outputFormat == "jpeg") "jpg" else outputFormat)
            } else {
                Pair(imageBytes, extension)
            }
        } catch (e: Exception) {
            // 처리 실패 시 원본 반환
            return Pair(imageBytes, extension)
        }
    }

    /**
     * 이미지에 투명도가 있는지 확인
     */
    private fun hasTransparency(image: java.awt.image.BufferedImage): Boolean {
        return image.colorModel.hasAlpha()
    }

    fun deleteFile(filePath: String) {
        try {
            val path = Paths.get(uploadPath, filePath.trimStart('/'))
            Files.deleteIfExists(path)
        } catch (e: Exception) {
            // 파일 삭제 실패는 무시 (로그만 남김)
        }
    }

    fun getFilePath(relativePath: String): Path {
        return Paths.get(uploadPath, relativePath.trimStart('/'))
    }
}
