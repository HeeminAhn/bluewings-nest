package com.bluewings.community.repository

import com.bluewings.community.domain.CommentImage
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class CommentImageRepository : PanacheRepository<CommentImage> {

    fun findByCommentId(commentId: Long): List<CommentImage> =
        list("comment.id = ?1 ORDER BY displayOrder ASC", commentId)

    fun deleteByCommentId(commentId: Long): Long =
        delete("comment.id", commentId)
}
