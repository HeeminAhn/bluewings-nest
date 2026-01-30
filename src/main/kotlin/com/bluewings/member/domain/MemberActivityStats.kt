package com.bluewings.member.domain

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate

@Entity
@Table(name = "member_activity_stats")
class MemberActivityStats(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    val member: Member,

    @Column(name = "post_count", nullable = false)
    var postCount: Int = 0,

    @Column(name = "comment_count", nullable = false)
    var commentCount: Int = 0,

    @Column(name = "like_count", nullable = false)
    var likeCount: Int = 0,

    @Column(name = "attendance_count", nullable = false)
    var attendanceCount: Int = 0,

    @Column(name = "last_attendance_date")
    var lastAttendanceDate: LocalDate? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    companion object {
        private const val POST_POINTS = 10
        private const val COMMENT_POINTS = 3
        private const val LIKE_POINTS = 1
        private const val ATTENDANCE_POINTS = 5

        fun createFor(member: Member): MemberActivityStats {
            return MemberActivityStats(member = member)
        }
    }

    fun calculateTotalPoints(): Int {
        return (postCount * POST_POINTS) +
                (commentCount * COMMENT_POINTS) +
                (likeCount * LIKE_POINTS) +
                (attendanceCount * ATTENDANCE_POINTS)
    }

    fun canAttendToday(): Boolean {
        return lastAttendanceDate != LocalDate.now()
    }

    fun recordAttendance() {
        attendanceCount++
        lastAttendanceDate = LocalDate.now()
        updatedAt = Instant.now()
    }

    fun incrementPostCount() {
        postCount++
        updatedAt = Instant.now()
    }

    fun incrementCommentCount() {
        commentCount++
        updatedAt = Instant.now()
    }

    fun incrementLikeCount() {
        likeCount++
        updatedAt = Instant.now()
    }

    fun decrementPostCount() {
        if (postCount > 0) {
            postCount--
            updatedAt = Instant.now()
        }
    }

    fun decrementCommentCount() {
        if (commentCount > 0) {
            commentCount--
            updatedAt = Instant.now()
        }
    }

    fun decrementLikeCount() {
        if (likeCount > 0) {
            likeCount--
            updatedAt = Instant.now()
        }
    }
}
