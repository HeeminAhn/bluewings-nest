package com.bluewings.member.domain

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "member_access_logs")
class MemberAccessLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    val member: Member? = null,

    @Column(nullable = false, length = 100)
    val email: String,

    @Column(name = "ip_address", nullable = false, length = 45)
    val ipAddress: String,

    @Column(name = "user_agent", length = 500)
    val userAgent: String? = null,

    @Column(name = "is_success", nullable = false)
    val isSuccess: Boolean,

    @Column(name = "failure_reason", length = 100)
    val failureReason: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
