package com.bluewings.community.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "comment_images")
class CommentImage() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    lateinit var comment: Comment

    @Column(name = "file_name", nullable = false)
    lateinit var fileName: String

    @Column(name = "original_name", nullable = false)
    lateinit var originalName: String

    @Column(name = "file_path", nullable = false)
    lateinit var filePath: String

    @Column(name = "file_size", nullable = false)
    var fileSize: Long = 0

    @Column(name = "content_type", nullable = false)
    lateinit var contentType: String

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    constructor(
        comment: Comment,
        fileName: String,
        originalName: String,
        filePath: String,
        fileSize: Long,
        contentType: String,
        displayOrder: Int = 0
    ) : this() {
        this.comment = comment
        this.fileName = fileName
        this.originalName = originalName
        this.filePath = filePath
        this.fileSize = fileSize
        this.contentType = contentType
        this.displayOrder = displayOrder
    }
}
