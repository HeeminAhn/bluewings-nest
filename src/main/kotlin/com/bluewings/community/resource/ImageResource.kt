package com.bluewings.community.resource

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.common.service.FileUploadService
import com.bluewings.community.dto.response.UploadImageResponse
import io.quarkus.security.Authenticated
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.jboss.resteasy.reactive.multipart.FileUpload
import org.jboss.resteasy.reactive.RestForm
import java.nio.file.Files

@Path("/api/images")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
class ImageResource {

    @Inject
    lateinit var fileUploadService: FileUploadService

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    fun uploadImage(@RestForm("file") file: FileUpload): ApiResponse<UploadImageResponse> {
        val contentType = file.contentType() ?: "application/octet-stream"
        val originalFileName = file.fileName() ?: "unknown"
        val fileSize = file.size()

        try {
            val inputStream = Files.newInputStream(file.uploadedFile())
            val uploadedFile = fileUploadService.uploadImage(
                inputStream = inputStream,
                originalFileName = originalFileName,
                contentType = contentType,
                fileSize = fileSize,
                subDirectory = "posts"
            )

            return ApiResponse.success(
                UploadImageResponse(
                    fileName = uploadedFile.fileName,
                    originalName = uploadedFile.originalName,
                    filePath = uploadedFile.filePath,
                    fileSize = uploadedFile.fileSize,
                    contentType = uploadedFile.contentType
                )
            )
        } catch (e: BusinessException) {
            throw e
        } catch (e: Exception) {
            throw BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "파일 업로드 중 오류가 발생했습니다: ${e.message}")
        }
    }

    @POST
    @Path("/upload/multiple")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    fun uploadMultipleImages(@RestForm("files") files: List<FileUpload>): ApiResponse<List<UploadImageResponse>> {
        val uploadedFiles = files.mapIndexed { index, file ->
            val contentType = file.contentType() ?: "application/octet-stream"
            val originalFileName = file.fileName() ?: "unknown_$index"
            val fileSize = file.size()

            try {
                val inputStream = Files.newInputStream(file.uploadedFile())
                val uploadedFile = fileUploadService.uploadImage(
                    inputStream = inputStream,
                    originalFileName = originalFileName,
                    contentType = contentType,
                    fileSize = fileSize,
                    subDirectory = "posts"
                )

                UploadImageResponse(
                    fileName = uploadedFile.fileName,
                    originalName = uploadedFile.originalName,
                    filePath = uploadedFile.filePath,
                    fileSize = uploadedFile.fileSize,
                    contentType = uploadedFile.contentType
                )
            } catch (e: BusinessException) {
                throw e
            } catch (e: Exception) {
                throw BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "파일 업로드 중 오류가 발생했습니다: ${e.message}")
            }
        }

        return ApiResponse.success(uploadedFiles)
    }
}
