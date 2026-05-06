package com.bluewings.community.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "posts")
class Post() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    lateinit var member: Member

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    var category: Category? = null

    @Column(nullable = false, length = 200)
    var title: String = ""

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String = ""

    @Column(name = "view_count", nullable = false)
    var viewCount: Int = 0

    @Column(name = "like_count", nullable = false)
    var likeCount: Int = 0

    @Column(name = "comment_count", nullable = false)
    var commentCount: Int = 0

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null

    @OneToMany(mappedBy = "post", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    var images: MutableList<PostImage> = mutableListOf()

    constructor(member: Member, title: String, content: String) : this() {
        this.member = member
        this.title = title
        this.content = content
    }

    fun update(title: String, content: String) {
        this.title = title
        this.content = content
        this.updatedAt = LocalDateTime.now()
    }

    fun softDelete() {
        this.deletedAt = LocalDateTime.now()
    }

    fun isDeleted(): Boolean = deletedAt != null
}
