package com.bluewings.report.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "member_reports")
class MemberReport(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    val reporter: Member,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_member_id", nullable = false)
    val reportedMember: Member,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val reason: ReportReason,

    @Column(length = 1000)
    val description: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", length = 20)
    val contentType: ContentType? = null,

    @Column(name = "content_id")
    val contentId: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ReportStatus = ReportStatus.PENDING,

    @Column(name = "processed_at")
    var processedAt: Instant? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    var processedBy: Member? = null,

    @Column(name = "admin_note", length = 500)
    var adminNote: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
) {
    fun process(admin: Member, status: ReportStatus, note: String?) {
        this.status = status
        this.processedBy = admin
        this.processedAt = Instant.now()
        this.adminNote = note
    }
}
