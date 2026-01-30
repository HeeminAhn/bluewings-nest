package com.bluewings.community.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "comments")
class Comment() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    lateinit var post: Post

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    lateinit var member: Member

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    var parent: Comment? = null

    @OneToMany(mappedBy = "parent", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("createdAt ASC")
    var replies: MutableList<Comment> = mutableListOf()

    @OneToMany(mappedBy = "comment", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    var images: MutableList<CommentImage> = mutableListOf()

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String = ""

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    constructor(post: Post, member: Member, content: String, parent: Comment? = null) : this() {
        this.post = post
        this.member = member
        this.content = content
        this.parent = parent
    }

    fun update(content: String) {
        this.content = content
        this.updatedAt = LocalDateTime.now()
    }

    val isReply: Boolean
        get() = parent != null
}
