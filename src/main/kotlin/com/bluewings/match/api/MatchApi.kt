package com.bluewings.match.api

import java.time.LocalDateTime

/**
 * Match 모듈의 공개 API
 */
interface MatchApi {
    /**
     * 다음 경기 정보 조회
     */
    fun getNextMatch(): MatchInfo?

    /**
     * 오늘 경기 여부 확인
     */
    fun hasMatchToday(): Boolean

    /**
     * 현재 시즌 블루윙즈 순위 조회
     */
    fun getCurrentRanking(): Int?

    /**
     * 특정 경기 정보 조회
     */
    fun getMatchInfo(matchId: Long): MatchInfo?
}

/**
 * 다른 모듈에 노출되는 경기 정보 DTO
 */
data class MatchInfo(
    val id: Long,
    val homeTeam: String,
    val awayTeam: String,
    val matchDate: LocalDateTime,
    val venue: String?,
    val homeScore: Int?,
    val awayScore: Int?,
    val isCompleted: Boolean
)
