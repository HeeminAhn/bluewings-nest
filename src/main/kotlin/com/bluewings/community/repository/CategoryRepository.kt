package com.bluewings.community.repository

import com.bluewings.community.domain.Category
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalDateTime

@ApplicationScoped
class CategoryRepository : PanacheRepository<Category> {

    fun findAllActive(): List<Category> {
        return find("isActive = true", Sort.by("displayOrder").ascending()).list()
    }

    fun findAllPaged(page: Int, size: Int): List<Category> {
        return findAll(Sort.by("displayOrder").ascending())
            .page(Page.of(page, size))
            .list()
    }

    fun findByName(name: String): Category? {
        return find("name", name).firstResult()
    }

    fun existsByName(name: String): Boolean {
        return count("name", name) > 0
    }

    fun existsByNameAndIdNot(name: String, id: Long): Boolean {
        return count("name = ?1 and id != ?2", name, id) > 0
    }

    fun findWithFilters(
        keyword: String?,
        isActive: Boolean?,
        page: Int,
        size: Int
    ): Pair<List<Category>, Long> {
        val conditions = mutableListOf<String>()
        val params = mutableMapOf<String, Any>()

        if (!keyword.isNullOrBlank()) {
            conditions.add("(name like :keyword or description like :keyword)")
            params["keyword"] = "%$keyword%"
        }

        if (isActive != null) {
            conditions.add("isActive = :isActive")
            params["isActive"] = isActive
        }

        val query = if (conditions.isEmpty()) {
            findAll(Sort.by("displayOrder").ascending())
        } else {
            find(conditions.joinToString(" and "), Sort.by("displayOrder").ascending(), params)
        }

        val categories = query.page(Page.of(page, size)).list()
        val totalCount = if (conditions.isEmpty()) {
            count()
        } else {
            count(conditions.joinToString(" and "), params)
        }

        return Pair(categories, totalCount)
    }
}
