package com.bluewings.member.service

import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberActivityStats
import com.bluewings.member.domain.MemberGrade
import com.bluewings.member.dto.response.GradeDetail
import com.bluewings.member.dto.response.GradeInfoResponse
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class GradeService {

    fun getGradeInfo(member: Member, activityStats: MemberActivityStats?): GradeInfoResponse {
        return GradeInfoResponse.from(member, activityStats)
    }

    fun getAllGrades(): List<GradeDetail> {
        return MemberGrade.entries.map { GradeDetail.from(it) }
    }

    fun calculateProgressPercentage(member: Member, totalPoints: Int): Int {
        val currentGrade = member.grade
        val currentIndex = MemberGrade.entries.indexOf(currentGrade)

        if (currentIndex >= MemberGrade.entries.size - 1) {
            return 100
        }

        val nextGrade = MemberGrade.entries[currentIndex + 1]
        val pointsInCurrentGrade = totalPoints - currentGrade.requiredPoints
        val pointsNeededForNext = nextGrade.requiredPoints - currentGrade.requiredPoints

        return ((pointsInCurrentGrade.toDouble() / pointsNeededForNext) * 100).toInt()
            .coerceIn(0, 100)
    }
}
