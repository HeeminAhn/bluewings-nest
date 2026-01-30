package com.bluewings.community.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.community.dto.response.CategoryResponse
import com.bluewings.community.repository.CategoryRepository
import jakarta.annotation.security.PermitAll
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Category", description = "카테고리 API")
class CategoryResource(
    private val categoryRepository: CategoryRepository
) {

    @GET
    @PermitAll
    @Operation(summary = "활성 카테고리 목록 조회", description = "활성화된 카테고리 목록을 조회합니다")
    fun getActiveCategories(): ApiResponse<List<CategoryResponse>> {
        val categories = categoryRepository.findAllActive()
        return ApiResponse.success(categories.map { CategoryResponse.from(it) })
    }
}
