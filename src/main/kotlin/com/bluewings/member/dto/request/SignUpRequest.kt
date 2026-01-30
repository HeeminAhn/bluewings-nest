package com.bluewings.member.dto.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class SignUpRequest(
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String,

    @field:NotBlank(message = "비밀번호는 필수입니다")
    @field:Size(min = 8, max = 50, message = "비밀번호는 8자 이상 50자 이하여야 합니다")
    @field:Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@\$!%*#?&])[A-Za-z\\d@\$!%*#?&]{8,}\$",
        message = "비밀번호는 영문, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다"
    )
    val password: String,

    @field:NotBlank(message = "닉네임은 필수입니다")
    @field:Size(min = 2, max = 30, message = "닉네임은 2자 이상 30자 이하여야 합니다")
    @field:Pattern(
        regexp = "^[가-힣a-zA-Z0-9_]+\$",
        message = "닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다"
    )
    val nickname: String
)
