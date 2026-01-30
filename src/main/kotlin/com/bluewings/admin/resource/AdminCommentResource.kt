package com.bluewings.admin.resource

import com.bluewings.admin.dto.response.AdminCommentResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.repository.CommentRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate

@Path("/api/admin/comments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Comment", description = "댓글 관리 API")
@RolesAllowed("ADMIN")
class AdminCommentResource(
    private val commentRepository: CommentRepository
) {
    @GET
    @Operation(summary = "댓글 목록 조회", description = "페이지네이션된 전체 댓글 목록을 조회합니다")
    fun getComments(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("authorNickname") authorNickname: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminCommentResponse>> {
        val result = commentRepository.findWithFilters(
            keyword = keyword,
            authorNickname = authorNickname,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminCommentResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다")
    fun deleteComment(@PathParam("id") id: Long): ApiResponse<Unit> {
        val comment = commentRepository.findById(id)
            ?: throw BusinessException(ErrorCode.COMMENT_NOT_FOUND)

        // 게시글의 댓글 수 감소
        val post = comment.post
        post.commentCount = maxOf(0, post.commentCount - 1)

        commentRepository.delete(comment)

        return ApiResponse.success(Unit)
    }
}
