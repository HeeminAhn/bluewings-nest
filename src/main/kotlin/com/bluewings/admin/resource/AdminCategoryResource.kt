package com.bluewings.admin.resource

import com.bluewings.admin.dto.request.CreateCategoryRequest
import com.bluewings.admin.dto.request.UpdateCategoryRequest
import com.bluewings.admin.dto.response.AdminCategoryResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.response.ApiResponse
import com.bluewings.community.domain.Category
import com.bluewings.community.repository.CategoryRepository
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/admin/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Category", description = "카테고리 관리 API")
@RolesAllowed("ADMIN")
class AdminCategoryResource(
    private val categoryRepository: CategoryRepository
) {

    @GET
    @Operation(summary = "카테고리 목록 조회", description = "페이지네이션된 카테고리 목록을 조회합니다")
    fun getCategories(
        @QueryParam("page") @DefaultValue("0") page: Int,
        @QueryParam("size") @DefaultValue("20") size: Int,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("isActive") isActive: Boolean?
    ): ApiResponse<PagedResponse<AdminCategoryResponse>> {
        val result = categoryRepository.findWithFilters(
            keyword = keyword,
            isActive = isActive,
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminCategoryResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "카테고리 상세 조회", description = "카테고리 상세 정보를 조회합니다")
    fun getCategory(@PathParam("id") id: Long): ApiResponse<AdminCategoryResponse> {
        val category = categoryRepository.findById(id)
            ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)

        return ApiResponse.success(AdminCategoryResponse.from(category))
    }

    @POST
    @Transactional
    @Operation(summary = "카테고리 생성", description = "새로운 카테고리를 생성합니다")
    fun createCategory(@Valid request: CreateCategoryRequest): ApiResponse<AdminCategoryResponse> {
        if (categoryRepository.existsByName(request.name)) {
            throw BusinessException(ErrorCode.CATEGORY_NAME_DUPLICATED)
        }

        val category = Category(
            name = request.name,
            description = request.description,
            displayOrder = request.displayOrder,
            color = request.color
        )

        categoryRepository.persist(category)

        return ApiResponse.success(AdminCategoryResponse.from(category))
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "카테고리 수정", description = "카테고리를 수정합니다")
    fun updateCategory(
        @PathParam("id") id: Long,
        @Valid request: UpdateCategoryRequest
    ): ApiResponse<AdminCategoryResponse> {
        val category = categoryRepository.findById(id)
            ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)

        request.name?.let { newName ->
            if (categoryRepository.existsByNameAndIdNot(newName, id)) {
                throw BusinessException(ErrorCode.CATEGORY_NAME_DUPLICATED)
            }
            category.name = newName
        }

        category.update(
            name = request.name ?: category.name,
            description = request.description ?: category.description,
            displayOrder = request.displayOrder ?: category.displayOrder,
            isActive = request.isActive ?: category.isActive,
            color = request.color ?: category.color
        )

        categoryRepository.persist(category)

        return ApiResponse.success(AdminCategoryResponse.from(category))
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "카테고리 삭제", description = "카테고리를 삭제합니다")
    fun deleteCategory(@PathParam("id") id: Long): ApiResponse<Unit> {
        val category = categoryRepository.findById(id)
            ?: throw BusinessException(ErrorCode.CATEGORY_NOT_FOUND)

        categoryRepository.delete(category)

        return ApiResponse.success(Unit)
    }
}
