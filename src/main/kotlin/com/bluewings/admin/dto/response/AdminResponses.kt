package com.bluewings.admin.dto.response

import com.bluewings.chat.domain.ChatMessage
import com.bluewings.community.domain.Comment
import com.bluewings.community.domain.Post
import com.bluewings.match.domain.Match
import com.bluewings.match.domain.MatchStatus
import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberAccessLog
import com.bluewings.member.domain.MemberGrade
import com.bluewings.member.domain.MemberRole
import com.bluewings.notice.domain.Notice
import com.bluewings.report.domain.ContentType
import com.bluewings.report.domain.MemberReport
import com.bluewings.report.domain.ReportReason
import com.bluewings.report.domain.ReportStatus
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

// 페이지네이션 응답
data class PagedResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val page: Int,
    val size: Int
)

// 회원 응답
data class AdminMemberResponse(
    val id: Long,
    val email: String,
    val nickname: String,
    val profileImageUrl: String?,
    val bio: String?,
    val grade: MemberGrade,
    val role: MemberRole,
    val isActive: Boolean,
    val isBlocked: Boolean,
    val blockedAt: Instant?,
    val blockedReason: String?,
    val blockedUntil: Instant?,
    val reportCount: Int,
    val createdAt: Instant,
    val updatedAt: Instant,
    val lastLoginAt: Instant?,
    val activityStats: ActivityStatsResponse?
) {
    companion object {
        fun from(member: Member): AdminMemberResponse {
            return AdminMemberResponse(
                id = member.id!!,
                email = member.email,
                nickname = member.nickname,
                profileImageUrl = member.profileImageUrl,
                bio = member.bio,
                grade = member.grade,
                role = member.role,
                isActive = member.isActive,
                isBlocked = member.isBlocked,
                blockedAt = member.blockedAt,
                blockedReason = member.blockedReason,
                blockedUntil = member.blockedUntil,
                reportCount = member.reportCount,
                createdAt = member.createdAt,
                updatedAt = member.updatedAt,
                lastLoginAt = member.lastLoginAt,
                activityStats = member.activityStats?.let {
                    ActivityStatsResponse(
                        totalPosts = it.postCount,
                        totalComments = it.commentCount,
                        totalPoints = it.calculateTotalPoints(),
                        attendanceCount = it.attendanceCount
                    )
                }
            )
        }
    }
}

data class ActivityStatsResponse(
    val totalPosts: Int,
    val totalComments: Int,
    val totalPoints: Int,
    val attendanceCount: Int
)

// 게시글 응답
data class AdminPostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val authorId: Long,
    val authorNickname: String,
    val categoryId: Long?,
    val categoryName: String?,
    val images: List<ImageInfo>,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(post: Post): AdminPostResponse {
            return AdminPostResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = post.commentCount,
                authorId = post.member.id!!,
                authorNickname = post.member.nickname,
                categoryId = post.category?.id,
                categoryName = post.category?.name,
                images = post.images.map { ImageInfo(it.fileName, it.originalName, it.filePath) },
                createdAt = post.createdAt,
                updatedAt = post.updatedAt
            )
        }
    }
}

data class ImageInfo(
    val fileName: String,
    val originalName: String,
    val filePath: String
)

// 공지사항 응답
data class AdminNoticeResponse(
    val id: Long,
    val title: String,
    val content: String,
    val isPinned: Boolean,
    val viewCount: Int,
    val authorId: Long,
    val authorNickname: String,
    val images: List<ImageInfo>,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(notice: Notice): AdminNoticeResponse {
            return AdminNoticeResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                isPinned = notice.isPinned,
                viewCount = notice.viewCount,
                authorId = notice.member.id!!,
                authorNickname = notice.member.nickname,
                images = notice.images.map { ImageInfo(it.fileName, it.originalName, it.filePath) },
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt
            )
        }
    }
}

// 경기 응답
data class AdminMatchResponse(
    val id: Long,
    val matchDate: LocalDate,
    val matchTime: LocalTime?,
    val homeTeam: String,
    val awayTeam: String,
    val homeScore: Int?,
    val awayScore: Int?,
    val stadium: String?,
    val competition: String,
    val season: String,
    val matchDay: Int?,
    val status: MatchStatus,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(match: Match): AdminMatchResponse {
            return AdminMatchResponse(
                id = match.id,
                matchDate = match.matchDate,
                matchTime = match.matchTime,
                homeTeam = match.homeTeam,
                awayTeam = match.awayTeam,
                homeScore = match.homeScore,
                awayScore = match.awayScore,
                stadium = match.stadium,
                competition = match.competition,
                season = match.season,
                matchDay = match.matchDay,
                status = match.status,
                createdAt = match.createdAt,
                updatedAt = match.updatedAt
            )
        }
    }
}

// 채팅 메시지 응답
data class AdminChatMessageResponse(
    val id: Long,
    val memberId: Long,
    val memberNickname: String,
    val content: String,
    val createdAt: Instant
) {
    companion object {
        fun from(message: ChatMessage): AdminChatMessageResponse {
            return AdminChatMessageResponse(
                id = message.id!!,
                memberId = message.member.id!!,
                memberNickname = message.member.nickname,
                content = message.content,
                createdAt = message.createdAt
            )
        }
    }
}

// 댓글 응답
data class AdminCommentResponse(
    val id: Long,
    val postId: Long,
    val postTitle: String,
    val authorId: Long,
    val authorNickname: String,
    val content: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: Comment): AdminCommentResponse {
            return AdminCommentResponse(
                id = comment.id,
                postId = comment.post.id,
                postTitle = comment.post.title,
                authorId = comment.member.id!!,
                authorNickname = comment.member.nickname,
                content = comment.content,
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}

// 대시보드 통계 응답
data class DashboardStatsResponse(
    val totalMembers: Long,
    val totalPosts: Long,
    val totalComments: Long,
    val todayNewMembers: Long,
    val todayNewPosts: Long,
    val pendingReports: Long,
    val blockedMembers: Long,
    val recentPosts: List<RecentPostInfo>,
    val recentMembers: List<RecentMemberInfo>,
    val upcomingMatches: List<UpcomingMatchInfo>
)

data class RecentPostInfo(
    val id: Long,
    val title: String,
    val authorNickname: String,
    val createdAt: LocalDateTime
)

data class RecentMemberInfo(
    val id: Long,
    val nickname: String,
    val email: String,
    val createdAt: Instant
)

data class UpcomingMatchInfo(
    val id: Long,
    val homeTeam: String,
    val awayTeam: String,
    val matchDate: LocalDate,
    val competition: String
)

// 접속 이력 응답
data class AdminAccessLogResponse(
    val id: Long,
    val memberId: Long?,
    val email: String,
    val ipAddress: String,
    val userAgent: String?,
    val isSuccess: Boolean,
    val failureReason: String?,
    val createdAt: Instant
) {
    companion object {
        fun from(log: MemberAccessLog): AdminAccessLogResponse {
            return AdminAccessLogResponse(
                id = log.id!!,
                memberId = log.member?.id,
                email = log.email,
                ipAddress = log.ipAddress,
                userAgent = log.userAgent,
                isSuccess = log.isSuccess,
                failureReason = log.failureReason,
                createdAt = log.createdAt
            )
        }
    }
}

// 카테고리 응답
data class AdminCategoryResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val displayOrder: Int,
    val isActive: Boolean,
    val color: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(category: com.bluewings.community.domain.Category): AdminCategoryResponse {
            return AdminCategoryResponse(
                id = category.id,
                name = category.name,
                description = category.description,
                displayOrder = category.displayOrder,
                isActive = category.isActive,
                color = category.color,
                createdAt = category.createdAt,
                updatedAt = category.updatedAt
            )
        }
    }
}

// 신고 응답
data class AdminReportResponse(
    val id: Long,
    val reporterId: Long,
    val reporterNickname: String,
    val reportedMemberId: Long,
    val reportedMemberNickname: String,
    val reason: ReportReason,
    val reasonDescription: String,
    val description: String?,
    val contentType: ContentType?,
    val contentId: Long?,
    val status: ReportStatus,
    val statusDescription: String,
    val processedAt: Instant?,
    val processedByNickname: String?,
    val adminNote: String?,
    val createdAt: Instant
) {
    companion object {
        fun from(report: MemberReport): AdminReportResponse {
            return AdminReportResponse(
                id = report.id!!,
                reporterId = report.reporter.id!!,
                reporterNickname = report.reporter.nickname,
                reportedMemberId = report.reportedMember.id!!,
                reportedMemberNickname = report.reportedMember.nickname,
                reason = report.reason,
                reasonDescription = report.reason.description,
                description = report.description,
                contentType = report.contentType,
                contentId = report.contentId,
                status = report.status,
                statusDescription = report.status.description,
                processedAt = report.processedAt,
                processedByNickname = report.processedBy?.nickname,
                adminNote = report.adminNote,
                createdAt = report.createdAt
            )
        }
    }
}
