package com.bluewings.member.cqrs

import com.bluewings.common.exception.InvalidCredentialsException
import com.bluewings.common.exception.MemberNotFoundException
import com.bluewings.common.security.PasswordEncoder
import com.bluewings.member.domain.Member
import com.bluewings.member.domain.MemberActivityStats
import com.bluewings.member.dto.response.GradeInfoResponse
import com.bluewings.member.dto.response.MemberProfileResponse
import com.bluewings.member.dto.response.MemberResponse
import com.bluewings.member.repository.MemberActivityStatsRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class MemberQueryHandler(
    private val memberRepository: MemberRepository,
    private val activityStatsRepository: MemberActivityStatsRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun handle(query: GetMemberByIdQuery): MemberResponse {
        val member = findActiveMember(query.memberId)
        val activityStats = findActivityStats(query.memberId)
        return MemberResponse.from(member, activityStats)
    }

    fun handle(query: GetMemberByEmailQuery): Member {
        return memberRepository.findByEmail(query.email)
            ?: throw MemberNotFoundException()
    }

    fun handle(query: GetMemberProfileQuery): MemberProfileResponse {
        val member = findActiveMember(query.memberId)
        val activityStats = findActivityStats(query.memberId)
        return MemberProfileResponse.from(member, activityStats)
    }

    fun handle(query: GetMemberGradeInfoQuery): GradeInfoResponse {
        val member = findActiveMember(query.memberId)
        val activityStats = findActivityStats(query.memberId)
        return GradeInfoResponse.from(member, activityStats)
    }

    fun handle(query: CheckEmailAvailableQuery): Boolean {
        return !memberRepository.existsByEmail(query.email)
    }

    fun handle(query: CheckNicknameAvailableQuery): Boolean {
        return !memberRepository.existsByNickname(query.nickname)
    }

    fun handle(query: ValidateCredentialsQuery): Member {
        val member = memberRepository.findByEmail(query.email)
            ?: throw InvalidCredentialsException()

        if (!member.isActive) {
            throw InvalidCredentialsException()
        }

        if (!passwordEncoder.matches(query.password, member.password)) {
            throw InvalidCredentialsException()
        }

        return member
    }

    private fun findActiveMember(memberId: Long): Member {
        return memberRepository.findActiveById(memberId)
            ?: throw MemberNotFoundException()
    }

    private fun findActivityStats(memberId: Long): MemberActivityStats? {
        return activityStatsRepository.findByMemberId(memberId)
    }
}
