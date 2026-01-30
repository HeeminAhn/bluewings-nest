package com.bluewings.common.resource

import com.bluewings.common.service.FileUploadService
import jakarta.inject.Inject
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.PathParam
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.Response
import java.nio.file.Files

@Path("/uploads")
class StaticResource {

    @Inject
    lateinit var fileUploadService: FileUploadService

    @GET
    @Path("/{subDirectory}/{fileName}")
    @Produces("image/*")
    fun getImage(
        @PathParam("subDirectory") subDirectory: String,
        @PathParam("fileName") fileName: String
    ): Response {
        val filePath = fileUploadService.getFilePath("$subDirectory/$fileName")

        if (!Files.exists(filePath)) {
            return Response.status(Response.Status.NOT_FOUND).build()
        }

        val contentType = Files.probeContentType(filePath) ?: "application/octet-stream"
        val fileBytes = Files.readAllBytes(filePath)

        return Response.ok(fileBytes)
            .header("Content-Type", contentType)
            .header("Cache-Control", "public, max-age=31536000")
            .build()
    }
}
