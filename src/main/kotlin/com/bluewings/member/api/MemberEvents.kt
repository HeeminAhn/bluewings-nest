package com.bluewings.member.api

import com.bluewings.shared.kernel.BaseDomainEvent

/**
 * 회원 가입 이벤트
 */
class MemberRegisteredEvent(
    memberId: Long,
    val email: String,
    val nickname: String
) : BaseDomainEvent(memberId)

/**
 * 회원 탈퇴 이벤트
 * - 다른 모듈에서 구독하여 관련 데이터 익명화 처리
 */
class MemberWithdrawnEvent(
    memberId: Long
) : BaseDomainEvent(memberId)

/**
 * 회원 차단 이벤트
 * - 채팅에서 강제 퇴장 등 처리
 */
class MemberBlockedEvent(
    memberId: Long,
    val reason: String?,
    val isPermanent: Boolean
) : BaseDomainEvent(memberId)

/**
 * 회원 차단 해제 이벤트
 */
class MemberUnblockedEvent(
    memberId: Long
) : BaseDomainEvent(memberId)

/**
 * 회원 등급 변경 이벤트
 */
class MemberGradeChangedEvent(
    memberId: Long,
    val previousGrade: String,
    val newGrade: String
) : BaseDomainEvent(memberId)

/**
 * 회원 프로필 변경 이벤트
 */
class MemberProfileUpdatedEvent(
    memberId: Long,
    val nickname: String,
    val profileImageUrl: String?
) : BaseDomainEvent(memberId)
