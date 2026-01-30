package com.bluewings.member.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.member.dto.request.LoginRequest
import com.bluewings.member.dto.request.SignUpRequest
import com.bluewings.member.dto.response.LoginResponse
import com.bluewings.member.dto.response.MemberResponse
import com.bluewings.member.service.MemberService
import io.vertx.ext.web.RoutingContext
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.HttpHeaders
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "인증", description = "회원가입, 로그인 등 인증 관련 API")
class AuthResource(
    private val memberService: MemberService
) {

    @POST
    @Path("/signup")
    @Operation(summary = "회원가입", description = "새로운 회원을 등록합니다")
    @APIResponses(
        APIResponse(responseCode = "200", description = "회원가입 성공"),
        APIResponse(responseCode = "409", description = "이메일 또는 닉네임 중복")
    )
    fun signUp(@Valid request: SignUpRequest): ApiResponse<MemberResponse> {
        val member = memberService.signUp(request)
        return ApiResponse.success(member)
    }

    @POST
    @Path("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다")
    @APIResponses(
        APIResponse(responseCode = "200", description = "로그인 성공"),
        APIResponse(responseCode = "401", description = "인증 실패")
    )
    fun login(
        @Valid request: LoginRequest,
        @Context routingContext: RoutingContext,
        @Context headers: HttpHeaders
    ): ApiResponse<LoginResponse> {
        // Cloudflare Tunnel 환경에서 실제 클라이언트 IP 가져오기
        val ipAddress = headers.getHeaderString("CF-Connecting-IP")
            ?: headers.getHeaderString("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()
            ?: headers.getHeaderString("X-Real-IP")
            ?: routingContext.request().remoteAddress()?.host()
            ?: "unknown"
        val userAgent = headers.getHeaderString("User-Agent")
        val response = memberService.login(request, ipAddress, userAgent)
        return ApiResponse.success(response)
    }

    @GET
    @Path("/check-email")
    @Operation(summary = "이메일 중복 확인", description = "이메일 사용 가능 여부를 확인합니다")
    fun checkEmail(
        @Parameter(description = "확인할 이메일", required = true)
        @QueryParam("email") email: String
    ): ApiResponse<Map<String, Boolean>> {
        val available = memberService.checkEmailAvailable(email)
        return ApiResponse.success(mapOf("available" to available))
    }

    @GET
    @Path("/check-nickname")
    @Operation(summary = "닉네임 중복 확인", description = "닉네임 사용 가능 여부를 확인합니다")
    fun checkNickname(
        @Parameter(description = "확인할 닉네임", required = true)
        @QueryParam("nickname") nickname: String
    ): ApiResponse<Map<String, Boolean>> {
        val available = memberService.checkNicknameAvailable(nickname)
        return ApiResponse.success(mapOf("available" to available))
    }
}
