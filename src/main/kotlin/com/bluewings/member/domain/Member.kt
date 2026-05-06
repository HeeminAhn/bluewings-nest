package com.bluewings.member.domain

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "members")
class Member(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true, length = 100)
    var email: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false, unique = true, length = 30)
    var nickname: String,

    @Column(name = "profile_image_url", length = 200)
    var profileImageUrl: String? = null,

    @Column(length = 500)
    var bio: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var grade: MemberGrade = MemberGrade.ROOKIE,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: MemberRole = MemberRole.USER,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),

    @Column(name = "last_login_at")
    var lastLoginAt: Instant? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "is_blocked", nullable = false)
    var isBlocked: Boolean = false,

    @Column(name = "blocked_at")
    var blockedAt: Instant? = null,

    @Column(name = "blocked_reason", length = 500)
    var blockedReason: String? = null,

    @Column(name = "blocked_until")
    var blockedUntil: Instant? = null,

    @Column(name = "report_count", nullable = false)
    var reportCount: Int = 0,

    @Column(name = "refresh_token", length = 2000)
    var refreshToken: String? = null,

    @Column(name = "refresh_token_expires_at")
    var refreshTokenExpiresAt: Instant? = null
) {
    @OneToOne(mappedBy = "member", cascade = [CascadeType.ALL], fetch = FetchType.LAZY, orphanRemoval = true)
    var activityStats: MemberActivityStats? = null

    fun updateProfile(nickname: String?, bio: String?, profileImageUrl: String?) {
        nickname?.let { this.nickname = it }
        bio?.let { this.bio = it }
        profileImageUrl?.let { this.profileImageUrl = it }
        this.updatedAt = Instant.now()
    }

    fun recordLogin() {
        this.lastLoginAt = Instant.now()
    }

    fun updateGrade(totalPoints: Int) {
        val newGrade = MemberGrade.fromPoints(totalPoints)
        if (newGrade != this.grade) {
            this.grade = newGrade
            this.updatedAt = Instant.now()
        }
    }

    fun getPointsToNextGrade(totalPoints: Int): Int? {
        val currentIndex = MemberGrade.entries.indexOf(grade)
        if (currentIndex >= MemberGrade.entries.size - 1) return null
        val nextGrade = MemberGrade.entries[currentIndex + 1]
        return nextGrade.requiredPoints - totalPoints
    }

    fun deactivate() {
        this.isActive = false
        this.updatedAt = Instant.now()
    }

    fun block(reason: String, until: Instant? = null) {
        this.isBlocked = true
        this.blockedAt = Instant.now()
        this.blockedReason = reason
        this.blockedUntil = until
        this.updatedAt = Instant.now()
    }

    fun unblock() {
        this.isBlocked = false
        this.blockedAt = null
        this.blockedReason = null
        this.blockedUntil = null
        this.updatedAt = Instant.now()
    }

    fun incrementReportCount() {
        this.reportCount++
        this.updatedAt = Instant.now()
    }

    fun isBlockExpired(): Boolean {
        return blockedUntil != null && Instant.now().isAfter(blockedUntil)
    }

    fun updateRefreshToken(token: String, expiresAt: Instant) {
        this.refreshToken = token
        this.refreshTokenExpiresAt = expiresAt
        this.updatedAt = Instant.now()
    }

    fun clearRefreshToken() {
        this.refreshToken = null
        this.refreshTokenExpiresAt = null
        this.updatedAt = Instant.now()
    }

    fun isRefreshTokenValid(token: String): Boolean {
        return this.refreshToken == token &&
            this.refreshTokenExpiresAt != null &&
            Instant.now().isBefore(this.refreshTokenExpiresAt)
    }
}
