package com.bluewings.community.repository

import com.bluewings.community.domain.PostImage
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class PostImageRepository : PanacheRepository<PostImage> {

    fun findByPostId(postId: Long): List<PostImage> =
        list("post.id = ?1 ORDER BY displayOrder ASC", postId)

    fun deleteByPostId(postId: Long): Long =
        delete("post.id", postId)
}
