package com.bluewings.member.api

/**
 * Member 모듈의 공개 API
 * 다른 모듈은 이 인터페이스를 통해서만 Member 모듈에 접근해야 함
 */
interface MemberApi {
    /**
     * 회원 정보 조회 (다른 모듈에서 사용)
     */
    fun getMemberInfo(memberId: Long): MemberInfo?

    /**
     * 회원 존재 여부 확인
     */
    fun existsById(memberId: Long): Boolean

    /**
     * 회원 닉네임 조회
     */
    fun getNickname(memberId: Long): String?

    /**
     * 회원 활동 증가 (게시글, 댓글, 좋아요)
     */
    fun incrementActivity(memberId: Long, activityType: MemberActivityType)

    /**
     * 회원 활동 감소
     */
    fun decrementActivity(memberId: Long, activityType: MemberActivityType)

    /**
     * 회원 차단 여부 확인
     */
    fun isBlocked(memberId: Long): Boolean
}

/**
 * 다른 모듈에 노출되는 회원 정보 DTO
 */
data class MemberInfo(
    val id: Long,
    val nickname: String,
    val profileImageUrl: String?,
    val gradeName: String,
    val isActive: Boolean
)

/**
 * 회원 활동 유형
 */
enum class MemberActivityType {
    POST, COMMENT, LIKE
}
