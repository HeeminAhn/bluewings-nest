package com.bluewings.notice.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notices")
class Notice() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    lateinit var member: Member

    @Column(nullable = false, length = 200)
    var title: String = ""

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String = ""

    @Column(name = "view_count", nullable = false)
    var viewCount: Int = 0

    @Column(name = "is_pinned", nullable = false)
    var isPinned: Boolean = false

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @OneToMany(mappedBy = "notice", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    var images: MutableList<NoticeImage> = mutableListOf()

    constructor(member: Member, title: String, content: String, isPinned: Boolean = false) : this() {
        this.member = member
        this.title = title
        this.content = content
        this.isPinned = isPinned
    }

    fun update(title: String, content: String, isPinned: Boolean) {
        this.title = title
        this.content = content
        this.isPinned = isPinned
        this.updatedAt = LocalDateTime.now()
    }

    fun incrementViewCount() {
        this.viewCount++
    }
}
