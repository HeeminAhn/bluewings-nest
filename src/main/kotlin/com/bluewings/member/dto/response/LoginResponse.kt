package com.bluewings.member.dto.response

data class LoginResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresIn: Long,
    val member: MemberResponse
)
