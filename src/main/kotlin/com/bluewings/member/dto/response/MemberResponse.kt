package com.bluewings.member.dto.response

import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberActivityStats
import com.bluewings.member.domain.MemberRole
import java.time.Instant

data class MemberResponse(
    val id: Long,
    val email: String,
    val nickname: String,
    val profileImageUrl: String?,
    val bio: String?,
    val grade: GradeInfoResponse,
    val totalPoints: Int,
    val role: MemberRole,
    val createdAt: Instant,
    val lastLoginAt: Instant?
) {
    companion object {
        fun from(member: Member, activityStats: MemberActivityStats?): MemberResponse {
            val totalPoints = activityStats?.calculateTotalPoints() ?: 0
            return MemberResponse(
                id = member.id!!,
                email = member.email,
                nickname = member.nickname,
                profileImageUrl = member.profileImageUrl,
                bio = member.bio,
                grade = GradeInfoResponse.from(member, activityStats),
                totalPoints = totalPoints,
                role = member.role,
                createdAt = member.createdAt,
                lastLoginAt = member.lastLoginAt
            )
        }
    }
}

data class MemberProfileResponse(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val bio: String?,
    val grade: GradeSummaryResponse,
    val totalPoints: Int,
    val createdAt: Instant
) {
    companion object {
        fun from(member: Member, activityStats: MemberActivityStats?): MemberProfileResponse {
            val totalPoints = activityStats?.calculateTotalPoints() ?: 0
            return MemberProfileResponse(
                id = member.id!!,
                nickname = member.nickname,
                profileImageUrl = member.profileImageUrl,
                bio = member.bio,
                grade = GradeSummaryResponse(
                    name = member.grade.name,
                    displayName = member.grade.displayName,
                    colorCode = member.grade.colorCode
                ),
                totalPoints = totalPoints,
                createdAt = member.createdAt
            )
        }
    }
}

data class GradeSummaryResponse(
    val name: String,
    val displayName: String,
    val colorCode: String
)
