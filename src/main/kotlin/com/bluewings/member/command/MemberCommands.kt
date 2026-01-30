package com.bluewings.member.command

sealed interface MemberCommand

data class SignUpCommand(
    val email: String,
    val password: String,
    val nickname: String
) : MemberCommand

data class UpdateProfileCommand(
    val memberId: Long,
    val nickname: String?,
    val bio: String?,
    val profileImageUrl: String?
) : MemberCommand

data class RecordAttendanceCommand(
    val memberId: Long
) : MemberCommand

data class RecordLoginCommand(
    val memberId: Long
) : MemberCommand

data class DeactivateMemberCommand(
    val memberId: Long
) : MemberCommand

data class WithdrawMemberCommand(
    val memberId: Long
) : MemberCommand

data class IncrementActivityCommand(
    val memberId: Long,
    val activityType: ActivityType
) : MemberCommand

data class DecrementActivityCommand(
    val memberId: Long,
    val activityType: ActivityType
) : MemberCommand

enum class ActivityType {
    POST, COMMENT, LIKE
}
