package com.bluewings.community.dto.response

import com.bluewings.community.domain.Category

data class CategoryResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val color: String
) {
    companion object {
        fun from(category: Category): CategoryResponse {
            return CategoryResponse(
                id = category.id,
                name = category.name,
                description = category.description,
                color = category.color
            )
        }
    }
}
