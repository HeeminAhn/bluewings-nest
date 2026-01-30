package com.bluewings.member.service

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.security.JwtService
import com.bluewings.member.command.*
import com.bluewings.member.domain.MemberAccessLog
import com.bluewings.member.dto.request.LoginRequest
import com.bluewings.member.dto.request.ProfileUpdateRequest
import com.bluewings.member.dto.request.SignUpRequest
import com.bluewings.member.dto.response.*
import com.bluewings.member.query.*
import com.bluewings.member.repository.MemberAccessLogRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional
import java.time.Instant

@ApplicationScoped
class MemberService(
    private val commandHandler: MemberCommandHandler,
    private val queryHandler: MemberQueryHandler,
    private val jwtService: JwtService,
    private val accessLogRepository: MemberAccessLogRepository,
    private val memberRepository: MemberRepository
) {

    // ==================== Commands ====================

    fun signUp(request: SignUpRequest): MemberResponse {
        val memberId = commandHandler.handle(
            SignUpCommand(
                email = request.email,
                password = request.password,
                nickname = request.nickname
            )
        )
        return queryHandler.handle(GetMemberByIdQuery(memberId))
    }

    fun login(request: LoginRequest, ipAddress: String? = null, userAgent: String? = null): LoginResponse {
        val member = try {
            queryHandler.handle(
                ValidateCredentialsQuery(
                    email = request.email,
                    password = request.password
                )
            )
        } catch (e: BusinessException) {
            // 로그인 실패 기록
            recordAccessLog(
                email = request.email,
                ipAddress = ipAddress ?: "unknown",
                userAgent = userAgent,
                isSuccess = false,
                failureReason = e.errorCode.message
            )
            throw e
        }

        // 차단 상태 확인
        if (member.isBlocked) {
            // 임시 차단이고 기간이 만료된 경우
            if (member.isBlockExpired()) {
                member.unblock()
            } else {
                recordAccessLog(
                    email = request.email,
                    memberId = member.id,
                    ipAddress = ipAddress ?: "unknown",
                    userAgent = userAgent,
                    isSuccess = false,
                    failureReason = "차단된 회원"
                )
                throw BusinessException(ErrorCode.MEMBER_BLOCKED)
            }
        }

        val memberId = member.id!!
        commandHandler.handle(RecordLoginCommand(memberId))

        // 로그인 성공 기록
        recordAccessLog(
            email = request.email,
            memberId = memberId,
            ipAddress = ipAddress ?: "unknown",
            userAgent = userAgent,
            isSuccess = true
        )

        val token = jwtService.generateToken(memberId, member.email, member.nickname, member.role.name)
        val memberResponse = queryHandler.handle(GetMemberByIdQuery(memberId))

        return LoginResponse(
            accessToken = token,
            expiresIn = 86400,
            member = memberResponse
        )
    }

    @Transactional
    fun recordAccessLog(
        email: String,
        memberId: Long? = null,
        ipAddress: String,
        userAgent: String?,
        isSuccess: Boolean,
        failureReason: String? = null
    ) {
        val member = memberId?.let { memberRepository.findById(it) }
        val log = MemberAccessLog(
            member = member,
            email = email,
            ipAddress = ipAddress,
            userAgent = userAgent,
            isSuccess = isSuccess,
            failureReason = failureReason
        )
        accessLogRepository.persist(log)
    }

    fun updateProfile(memberId: Long, request: ProfileUpdateRequest): MemberResponse {
        commandHandler.handle(
            UpdateProfileCommand(
                memberId = memberId,
                nickname = request.nickname,
                bio = request.bio,
                profileImageUrl = request.profileImageUrl
            )
        )
        return queryHandler.handle(GetMemberByIdQuery(memberId))
    }

    fun recordAttendance(memberId: Long): AttendanceResponse {
        return commandHandler.handle(RecordAttendanceCommand(memberId))
    }

    fun incrementActivity(memberId: Long, activityType: ActivityType) {
        commandHandler.handle(IncrementActivityCommand(memberId, activityType))
    }

    fun decrementActivity(memberId: Long, activityType: ActivityType) {
        commandHandler.handle(DecrementActivityCommand(memberId, activityType))
    }

    fun deactivateMember(memberId: Long) {
        commandHandler.handle(DeactivateMemberCommand(memberId))
    }

    fun withdrawMember(memberId: Long) {
        commandHandler.handle(WithdrawMemberCommand(memberId))
    }

    // ==================== Queries ====================

    fun getMyProfile(memberId: Long): MemberResponse {
        return queryHandler.handle(GetMemberByIdQuery(memberId))
    }

    fun getMemberProfile(memberId: Long): MemberProfileResponse {
        return queryHandler.handle(GetMemberProfileQuery(memberId))
    }

    fun getGradeInfo(memberId: Long): GradeInfoResponse {
        return queryHandler.handle(GetMemberGradeInfoQuery(memberId))
    }

    fun checkEmailAvailable(email: String): Boolean {
        return queryHandler.handle(CheckEmailAvailableQuery(email))
    }

    fun checkNicknameAvailable(nickname: String): Boolean {
        return queryHandler.handle(CheckNicknameAvailableQuery(nickname))
    }
}
