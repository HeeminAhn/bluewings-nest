package com.bluewings.member.dto.request

import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class ProfileUpdateRequest(
    @field:Size(min = 2, max = 30, message = "닉네임은 2자 이상 30자 이하여야 합니다")
    @field:Pattern(
        regexp = "^[가-힣a-zA-Z0-9_]+\$",
        message = "닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다"
    )
    val nickname: String? = null,

    @field:Size(max = 500, message = "자기소개는 500자 이하여야 합니다")
    val bio: String? = null,

    @field:Size(max = 200, message = "프로필 이미지 URL은 200자 이하여야 합니다")
    val profileImageUrl: String? = null
)
