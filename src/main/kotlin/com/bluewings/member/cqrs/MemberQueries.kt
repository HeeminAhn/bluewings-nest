package com.bluewings.member.cqrs

sealed interface MemberQuery

data class GetMemberByIdQuery(
    val memberId: Long
) : MemberQuery

data class GetMemberByEmailQuery(
    val email: String
) : MemberQuery

data class GetMemberProfileQuery(
    val memberId: Long
) : MemberQuery

data class GetMemberGradeInfoQuery(
    val memberId: Long
) : MemberQuery

data class CheckEmailAvailableQuery(
    val email: String
) : MemberQuery

data class CheckNicknameAvailableQuery(
    val nickname: String
) : MemberQuery

data class ValidateCredentialsQuery(
    val email: String,
    val password: String
) : MemberQuery
