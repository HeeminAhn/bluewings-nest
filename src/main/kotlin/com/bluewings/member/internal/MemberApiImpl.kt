package com.bluewings.member.internal

import com.bluewings.member.api.MemberActivityType
import com.bluewings.member.api.MemberApi
import com.bluewings.member.api.MemberInfo
import com.bluewings.member.cqrs.ActivityType
import com.bluewings.member.cqrs.DecrementActivityCommand
import com.bluewings.member.cqrs.IncrementActivityCommand
import com.bluewings.member.cqrs.MemberCommandHandler
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped

/**
 * MemberApi 구현체
 * 다른 모듈에서 Member 모듈에 접근할 때 사용
 */
@ApplicationScoped
class MemberApiImpl(
    private val memberRepository: MemberRepository,
    private val commandHandler: MemberCommandHandler
) : MemberApi {

    override fun getMemberInfo(memberId: Long): MemberInfo? {
        val member = memberRepository.findById(memberId) ?: return null
        return MemberInfo(
            id = member.id!!,
            nickname = member.nickname,
            profileImageUrl = member.profileImageUrl,
            gradeName = member.grade.name,
            isActive = member.isActive
        )
    }

    override fun existsById(memberId: Long): Boolean {
        return memberRepository.findById(memberId) != null
    }

    override fun getNickname(memberId: Long): String? {
        return memberRepository.findById(memberId)?.nickname
    }

    override fun incrementActivity(memberId: Long, activityType: MemberActivityType) {
        commandHandler.handle(
            IncrementActivityCommand(
                memberId = memberId,
                activityType = activityType.toInternal()
            )
        )
    }

    override fun decrementActivity(memberId: Long, activityType: MemberActivityType) {
        commandHandler.handle(
            DecrementActivityCommand(
                memberId = memberId,
                activityType = activityType.toInternal()
            )
        )
    }

    override fun isBlocked(memberId: Long): Boolean {
        val member = memberRepository.findById(memberId) ?: return false
        return member.isBlocked && !member.isBlockExpired()
    }

    private fun MemberActivityType.toInternal(): ActivityType {
        return when (this) {
            MemberActivityType.POST -> ActivityType.POST
            MemberActivityType.COMMENT -> ActivityType.COMMENT
            MemberActivityType.LIKE -> ActivityType.LIKE
        }
    }
}
