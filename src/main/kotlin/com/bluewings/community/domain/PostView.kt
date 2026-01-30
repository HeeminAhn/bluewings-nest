package com.bluewings.community.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "post_views")
class PostView() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    lateinit var post: Post

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    var member: Member? = null

    @Column(name = "ip_address", length = 45)
    var ipAddress: String? = null

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    constructor(post: Post, member: Member?, ipAddress: String?) : this() {
        this.post = post
        this.member = member
        this.ipAddress = ipAddress
    }
}
