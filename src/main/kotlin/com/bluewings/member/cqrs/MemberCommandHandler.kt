package com.bluewings.member.cqrs

import com.bluewings.common.exception.*
import com.bluewings.common.security.PasswordEncoder
import com.bluewings.member.api.MemberRegisteredEvent
import com.bluewings.member.api.MemberWithdrawnEvent
import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberActivityStats
import com.bluewings.member.dto.response.AttendanceResponse
import com.bluewings.member.dto.response.FortuneCookieResponse
import com.bluewings.member.repository.MemberActivityStatsRepository
import com.bluewings.member.repository.MemberRepository
import com.bluewings.member.service.FortuneCookieService
import com.bluewings.shared.kernel.EventBus
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import java.time.LocalDate

@ApplicationScoped
class MemberCommandHandler(
    private val memberRepository: MemberRepository,
    private val activityStatsRepository: MemberActivityStatsRepository,
    private val passwordEncoder: PasswordEncoder,
    private val fortuneCookieService: FortuneCookieService,
    private val eventBus: EventBus
) {

    @Transactional
    fun handle(command: SignUpCommand): Long {
        validateEmailNotDuplicated(command.email)
        validateNicknameNotDuplicated(command.nickname)

        val member = Member(
            email = command.email,
            password = passwordEncoder.encode(command.password),
            nickname = command.nickname
        )

        memberRepository.persist(member)

        val activityStats = MemberActivityStats.createFor(member)
        activityStatsRepository.persist(activityStats)

        // 회원 가입 이벤트 발행
        eventBus.publish(MemberRegisteredEvent(
            memberId = member.id!!,
            email = member.email,
            nickname = member.nickname
        ))

        return member.id!!
    }

    @Transactional
    fun handle(command: UpdateProfileCommand): Unit {
        val member = findActiveMember(command.memberId)

        command.nickname?.let { newNickname ->
            if (newNickname != member.nickname && memberRepository.existsByNickname(newNickname)) {
                throw NicknameDuplicatedException()
            }
        }

        member.updateProfile(
            nickname = command.nickname,
            bio = command.bio,
            profileImageUrl = command.profileImageUrl
        )
    }

    @Transactional
    fun handle(command: RecordAttendanceCommand): AttendanceResponse {
        val member = findActiveMember(command.memberId)
        val activityStats = findActivityStats(command.memberId)

        if (!activityStats.canAttendToday()) {
            throw AlreadyAttendedException()
        }

        activityStats.recordAttendance()
        val totalPoints = activityStats.calculateTotalPoints()
        member.updateGrade(totalPoints)

        val fortuneCookie = fortuneCookieService.getRandomFortuneCookie()

        return AttendanceResponse(
            attendanceCount = activityStats.attendanceCount,
            lastAttendanceDate = LocalDate.now(),
            earnedPoints = 5,
            totalPoints = totalPoints,
            message = "출석 체크 완료! +5 포인트",
            fortuneCookie = FortuneCookieResponse(
                message = fortuneCookie.message,
                category = fortuneCookie.category
            )
        )
    }

    @Transactional
    fun handle(command: RecordLoginCommand): Unit {
        val member = findActiveMember(command.memberId)
        member.recordLogin()
    }

    @Transactional
    fun handle(command: DeactivateMemberCommand): Unit {
        val member = findActiveMember(command.memberId)
        member.deactivate()
    }

    @Transactional
    fun handle(command: WithdrawMemberCommand): Unit {
        val member = findActiveMember(command.memberId)
        val memberId = member.id!!

        // 개인정보 익명화
        val anonymizedId = "withdrawn_$memberId"
        member.email = "$anonymizedId@deleted.local"
        member.nickname = "탈퇴한 회원"
        member.password = "WITHDRAWN"
        member.profileImageUrl = null
        member.bio = null

        // 비활성화
        member.deactivate()

        // 회원 탈퇴 이벤트 발행 - 다른 모듈에서 관련 데이터 정리
        eventBus.publish(MemberWithdrawnEvent(memberId))
    }

    @Transactional
    fun handle(command: IncrementActivityCommand): Unit {
        val member = findActiveMember(command.memberId)
        val activityStats = findActivityStats(command.memberId)

        when (command.activityType) {
            ActivityType.POST -> activityStats.incrementPostCount()
            ActivityType.COMMENT -> activityStats.incrementCommentCount()
            ActivityType.LIKE -> activityStats.incrementLikeCount()
        }

        member.updateGrade(activityStats.calculateTotalPoints())
    }

    @Transactional
    fun handle(command: DecrementActivityCommand): Unit {
        val member = findActiveMember(command.memberId)
        val activityStats = findActivityStats(command.memberId)

        when (command.activityType) {
            ActivityType.POST -> activityStats.decrementPostCount()
            ActivityType.COMMENT -> activityStats.decrementCommentCount()
            ActivityType.LIKE -> activityStats.decrementLikeCount()
        }

        member.updateGrade(activityStats.calculateTotalPoints())
    }

    private fun findActiveMember(memberId: Long): Member {
        return memberRepository.findActiveById(memberId)
            ?: throw MemberNotFoundException()
    }

    private fun findActivityStats(memberId: Long): MemberActivityStats {
        return activityStatsRepository.findByMemberId(memberId)
            ?: createActivityStatsForMember(memberId)
    }

    private fun createActivityStatsForMember(memberId: Long): MemberActivityStats {
        val member = findActiveMember(memberId)
        val activityStats = MemberActivityStats.createFor(member)
        activityStatsRepository.persist(activityStats)
        return activityStats
    }

    private fun validateEmailNotDuplicated(email: String) {
        if (memberRepository.existsByEmail(email)) {
            throw EmailDuplicatedException()
        }
    }

    private fun validateNicknameNotDuplicated(nickname: String) {
        if (memberRepository.existsByNickname(nickname)) {
            throw NicknameDuplicatedException()
        }
    }
}
