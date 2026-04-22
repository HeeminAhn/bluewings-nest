package com.bluewings.community.resource

import com.bluewings.common.pagination.PageParams
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.cqrs.*
import com.bluewings.community.dto.request.CreateCommentRequest
import com.bluewings.community.dto.request.UpdateCommentRequest
import com.bluewings.community.dto.response.CommentResponse
import com.bluewings.community.dto.response.PagedCommentResponse
import jakarta.annotation.security.PermitAll
import jakarta.annotation.security.RolesAllowed
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/posts/{postId}/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Comment", description = "댓글 API")
class CommentResource(
    private val commandHandler: PostCommandHandler,
    private val queryHandler: PostQueryHandler,
    private val jwt: JsonWebToken
) {
    private fun getCurrentMemberId(): Long {
        val claim = jwt.getClaim<Any>("memberId")
        return when (claim) {
            is Long -> claim
            is Number -> claim.toLong()
            is String -> claim.toLong()
            else -> jwt.subject.toLong()
        }
    }

    @GET
    @PermitAll
    @Operation(summary = "댓글 목록 조회", description = "게시글의 댓글 목록을 조회합니다")
    fun getComments(
        @PathParam("postId") postId: Long,
        @Valid @BeanParam pageParams: PageParams
    ): ApiResponse<PagedCommentResponse> {
        val query = GetCommentsByPostQuery(postId = postId, page = pageParams.page, size = pageParams.size)
        val result = queryHandler.handle(query)
        return ApiResponse.success(result)
    }

    @POST
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "댓글 작성", description = "게시글에 댓글을 작성합니다 (대댓글, 이미지 지원)")
    fun createComment(
        @PathParam("postId") postId: Long,
        @Valid request: CreateCommentRequest
    ): ApiResponse<CommentResponse> {
        val command = CreateCommentCommand(
            postId = postId,
            memberId = getCurrentMemberId(),
            content = request.content,
            parentId = request.parentId,
            images = request.images.map { img ->
                ImageData(
                    fileName = img.fileName,
                    originalName = img.originalName,
                    filePath = img.filePath,
                    fileSize = img.fileSize,
                    contentType = img.contentType
                )
            }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    @PUT
    @Path("/{commentId}")
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "댓글 수정", description = "자신의 댓글을 수정합니다 (이미지 지원)")
    fun updateComment(
        @PathParam("postId") postId: Long,
        @PathParam("commentId") commentId: Long,
        @Valid request: UpdateCommentRequest
    ): ApiResponse<CommentResponse> {
        val command = UpdateCommentCommand(
            commentId = commentId,
            memberId = getCurrentMemberId(),
            content = request.content,
            images = request.images.map { img ->
                ImageData(
                    fileName = img.fileName,
                    originalName = img.originalName,
                    filePath = img.filePath,
                    fileSize = img.fileSize,
                    contentType = img.contentType
                )
            }
        )
        val result = commandHandler.handle(command)
        return ApiResponse.success(result)
    }

    @DELETE
    @Path("/{commentId}")
    @RolesAllowed("USER", "ADMIN")
    @Operation(summary = "댓글 삭제", description = "자신의 댓글을 삭제합니다")
    fun deleteComment(
        @PathParam("postId") postId: Long,
        @PathParam("commentId") commentId: Long
    ): ApiResponse<Unit> {
        val command = DeleteCommentCommand(
            commentId = commentId,
            memberId = getCurrentMemberId()
        )
        commandHandler.handle(command)
        return ApiResponse.success(Unit)
    }
}
