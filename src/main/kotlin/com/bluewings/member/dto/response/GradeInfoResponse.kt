package com.bluewings.member.dto.response

import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberActivityStats
import com.bluewings.member.domain.MemberGrade

data class GradeInfoResponse(
    val currentGrade: GradeDetail,
    val nextGrade: GradeDetail?,
    val currentPoints: Int,
    val pointsToNextGrade: Int?,
    val activityStats: ActivityStatsResponse
) {
    companion object {
        fun from(member: Member, activityStats: MemberActivityStats?): GradeInfoResponse {
            val currentIndex = MemberGrade.entries.indexOf(member.grade)
            val nextGrade = if (currentIndex < MemberGrade.entries.size - 1) {
                MemberGrade.entries[currentIndex + 1]
            } else null

            val totalPoints = activityStats?.calculateTotalPoints() ?: 0

            return GradeInfoResponse(
                currentGrade = GradeDetail.from(member.grade),
                nextGrade = nextGrade?.let { GradeDetail.from(it) },
                currentPoints = totalPoints,
                pointsToNextGrade = member.getPointsToNextGrade(totalPoints),
                activityStats = ActivityStatsResponse(
                    postCount = activityStats?.postCount ?: 0,
                    commentCount = activityStats?.commentCount ?: 0,
                    likeCount = activityStats?.likeCount ?: 0,
                    attendanceCount = activityStats?.attendanceCount ?: 0,
                    lastAttendanceDate = activityStats?.lastAttendanceDate?.toString()
                )
            )
        }
    }
}

data class GradeDetail(
    val name: String,
    val displayName: String,
    val requiredPoints: Int,
    val colorCode: String,
    val description: String
) {
    companion object {
        fun from(grade: MemberGrade): GradeDetail {
            return GradeDetail(
                name = grade.name,
                displayName = grade.displayName,
                requiredPoints = grade.requiredPoints,
                colorCode = grade.colorCode,
                description = grade.description
            )
        }
    }
}

data class ActivityStatsResponse(
    val postCount: Int,
    val commentCount: Int,
    val likeCount: Int,
    val attendanceCount: Int,
    val lastAttendanceDate: String?
)
