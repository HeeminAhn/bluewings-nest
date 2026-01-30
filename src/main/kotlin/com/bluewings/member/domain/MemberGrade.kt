package com.bluewings.member.domain

enum class MemberGrade(
    val displayName: String,
    val requiredPoints: Int,
    val colorCode: String,
    val description: String
) {
    ROOKIE(
        displayName = "신입 서포터",
        requiredPoints = 0,
        colorCode = "#9E9E9E",
        description = "블루윙즈의 새로운 가족입니다"
    ),
    SUPPORTER(
        displayName = "블루 서포터",
        requiredPoints = 100,
        colorCode = "#64B5F6",
        description = "팀을 향한 응원을 시작한 서포터"
    ),
    FANATIC(
        displayName = "블루 파나틱",
        requiredPoints = 500,
        colorCode = "#1976D2",
        description = "열정적인 블루윙즈 팬"
    ),
    ULTRAS(
        displayName = "블루 울트라스",
        requiredPoints = 1500,
        colorCode = "#0D47A1",
        description = "블루윙즈의 핵심 서포터"
    ),
    LEGEND(
        displayName = "빅버드 레전드",
        requiredPoints = 5000,
        colorCode = "#FFD700",
        description = "블루윙즈를 대표하는 레전드 서포터"
    );

    companion object {
        fun fromPoints(points: Int): MemberGrade {
            return entries.sortedByDescending { it.requiredPoints }
                .first { points >= it.requiredPoints }
        }
    }
}
