package com.bluewings.admin.dto.request

import com.bluewings.match.domain.MatchStatus
import com.bluewings.member.domain.MemberRole
import com.bluewings.report.domain.ReportStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime

// 회원 수정 요청
data class UpdateMemberRequest(
    val role: MemberRole?,
    val isActive: Boolean?,
    val isBlocked: Boolean?
)

// 회원 차단 요청
data class BlockMemberRequest(
    @field:NotBlank(message = "차단 사유는 필수입니다")
    val reason: String,
    val until: Instant?  // null이면 영구 차단
)

// 신고 처리 요청
data class ProcessReportRequest(
    @field:NotNull(message = "처리 상태는 필수입니다")
    val status: ReportStatus,
    val adminNote: String?
)

// 경기 생성/수정 요청
data class CreateMatchRequest(
    @field:NotNull(message = "경기 날짜는 필수입니다")
    val matchDate: LocalDate,
    val matchTime: LocalTime?,
    @field:NotBlank(message = "홈팀은 필수입니다")
    val homeTeam: String,
    @field:NotBlank(message = "원정팀은 필수입니다")
    val awayTeam: String,
    val homeScore: Int?,
    val awayScore: Int?,
    val stadium: String?,
    @field:NotBlank(message = "대회명은 필수입니다")
    val competition: String,
    @field:NotBlank(message = "시즌은 필수입니다")
    val season: String,
    val matchDay: Int?,
    @field:NotNull(message = "상태는 필수입니다")
    val status: MatchStatus
)

data class UpdateMatchRequest(
    val matchDate: LocalDate?,
    val matchTime: LocalTime?,
    val homeTeam: String?,
    val awayTeam: String?,
    val homeScore: Int?,
    val awayScore: Int?,
    val stadium: String?,
    val competition: String?,
    val season: String?,
    val matchDay: Int?,
    val status: MatchStatus?
)

// 공지사항 생성/수정 요청
data class AdminCreateNoticeRequest(
    @field:NotBlank(message = "제목은 필수입니다")
    val title: String,
    @field:NotBlank(message = "내용은 필수입니다")
    val content: String,
    val isPinned: Boolean = false,
    val images: List<ImageRequest> = emptyList()
)

data class AdminUpdateNoticeRequest(
    val title: String?,
    val content: String?,
    val isPinned: Boolean?,
    val images: List<ImageRequest>?
)

data class ImageRequest(
    val fileName: String,
    val originalName: String,
    val filePath: String,
    val fileSize: Long,
    val contentType: String
)

// 순위표 업데이트 요청
data class UpdateStandingsRequest(
    val standings: List<StandingEntry>
)

data class StandingEntry(
    val teamName: String,
    val position: Int,
    val played: Int,
    val won: Int,
    val drawn: Int,
    val lost: Int,
    val goalsFor: Int,
    val goalsAgainst: Int,
    val points: Int
)

// 카테고리 생성 요청
data class CreateCategoryRequest(
    @field:NotBlank(message = "카테고리명은 필수입니다")
    val name: String,
    val description: String?,
    val displayOrder: Int = 0,
    val color: String = "gray"
)

// 카테고리 수정 요청
data class UpdateCategoryRequest(
    val name: String?,
    val description: String?,
    val displayOrder: Int?,
    val isActive: Boolean?,
    val color: String?
)
