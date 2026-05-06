package com.bluewings.admin.resource

import com.bluewings.admin.dto.response.AdminPostResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.pagination.PageParams
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.repository.CategoryRepository
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostLikeRepository
import com.bluewings.community.repository.PostRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate

@Path("/api/admin/posts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Post", description = "게시글 관리 API")
@RolesAllowed("ADMIN")
class AdminPostResource(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val postLikeRepository: PostLikeRepository,
    private val categoryRepository: CategoryRepository
) {
    @GET
    @Operation(summary = "게시글 목록 조회", description = "페이지네이션된 게시글 목록을 조회합니다")
    fun getPosts(
        @Valid @BeanParam pageParams: PageParams,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("authorNickname") authorNickname: String?,
        @QueryParam("categoryId") categoryId: Long?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminPostResponse>> {
        val page = pageParams.page
        val size = pageParams.size

        val result = postRepository.findWithFilters(
            keyword = keyword,
            authorNickname = authorNickname,
            categoryId = categoryId,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminPostResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "게시글 상세 조회", description = "게시글 상세 정보를 조회합니다")
    fun getPost(@PathParam("id") id: Long): ApiResponse<AdminPostResponse> {
        val post = postRepository.findById(id)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        return ApiResponse.success(AdminPostResponse.from(post))
    }

    @PATCH
    @Path("/{id}/category")
    @Transactional
    @Operation(summary = "게시글 카테고리 변경", description = "게시글의 카테고리를 변경합니다")
    fun updatePostCategory(
        @PathParam("id") id: Long,
        request: UpdatePostCategoryRequest
    ): ApiResponse<AdminPostResponse> {
        val post = postRepository.findById(id)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        val category = if (request.categoryId != null) {
            categoryRepository.findById(request.categoryId)
                ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)
        } else {
            null
        }

        post.category = category
        postRepository.persist(post)

        return ApiResponse.success(AdminPostResponse.from(post))
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다")
    fun deletePost(@PathParam("id") id: Long): ApiResponse<Unit> {
        val post = postRepository.findById(id)
            ?: throw BusinessException(ErrorCode.POST_NOT_FOUND)

        // 관련 댓글, 좋아요 삭제
        commentRepository.deleteByPostId(id)
        postLikeRepository.deleteByPostId(id)
        postRepository.delete(post)

        return ApiResponse.success(Unit)
    }
}

data class UpdatePostCategoryRequest(
    val categoryId: Long?
)
