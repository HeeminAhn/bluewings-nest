package com.bluewings.member.resource

import com.bluewings.common.response.ApiResponse
import com.bluewings.member.dto.request.ProfileUpdateRequest
import com.bluewings.member.dto.response.AttendanceResponse
import com.bluewings.member.dto.response.GradeInfoResponse
import com.bluewings.member.dto.response.MemberProfileResponse
import com.bluewings.member.dto.response.MemberResponse
import com.bluewings.member.service.MemberService
import io.quarkus.security.Authenticated
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement
import org.eclipse.microprofile.openapi.annotations.tags.Tag

@Path("/api/members")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "회원", description = "회원 프로필, 등급, 출석 관련 API")
@SecurityRequirement(name = "bearerAuth")
class MemberResource(
    private val memberService: MemberService,
    private val jwt: JsonWebToken
) {

    private fun getCurrentMemberId(): Long {
        val claim = jwt.getClaim<Any>("memberId")
        return when (claim) {
            is Long -> claim
            is Number -> claim.toLong()
            is String -> claim.toLong()
            else -> jwt.subject.toLong()
        }
    }

    @GET
    @Path("/me")
    @Operation(summary = "내 프로필 조회", description = "로그인한 회원의 프로필 정보를 조회합니다")
    @APIResponses(
        APIResponse(responseCode = "200", description = "조회 성공"),
        APIResponse(responseCode = "401", description = "인증 필요")
    )
    fun getMyProfile(): ApiResponse<MemberResponse> {
        val memberId = getCurrentMemberId()
        val profile = memberService.getMyProfile(memberId)
        return ApiResponse.success(profile)
    }

    @PATCH
    @Path("/me")
    @Operation(summary = "내 프로필 수정", description = "로그인한 회원의 프로필 정보를 수정합니다")
    @APIResponses(
        APIResponse(responseCode = "200", description = "수정 성공"),
        APIResponse(responseCode = "409", description = "닉네임 중복")
    )
    fun updateMyProfile(@Valid request: ProfileUpdateRequest): ApiResponse<MemberResponse> {
        val memberId = getCurrentMemberId()
        val updated = memberService.updateProfile(memberId, request)
        return ApiResponse.success(updated)
    }

    @GET
    @Path("/me/grade")
    @Operation(summary = "내 등급 정보 조회", description = "로그인한 회원의 등급 및 활동 통계를 조회합니다")
    fun getMyGrade(): ApiResponse<GradeInfoResponse> {
        val memberId = getCurrentMemberId()
        val gradeInfo = memberService.getGradeInfo(memberId)
        return ApiResponse.success(gradeInfo)
    }

    @POST
    @Path("/me/attendance")
    @Operation(summary = "출석 체크", description = "오늘의 출석 체크를 진행합니다 (하루 1회)")
    @APIResponses(
        APIResponse(responseCode = "200", description = "출석 체크 성공"),
        APIResponse(responseCode = "400", description = "이미 출석 완료")
    )
    fun recordAttendance(): ApiResponse<AttendanceResponse> {
        val memberId = getCurrentMemberId()
        val result = memberService.recordAttendance(memberId)
        return ApiResponse.success(result)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "회원 프로필 조회", description = "특정 회원의 공개 프로필을 조회합니다")
    @APIResponse(responseCode = "200", description = "조회 성공")
    @APIResponse(responseCode = "404", description = "회원을 찾을 수 없음")
    fun getMemberProfile(
        @Parameter(description = "회원 ID", required = true)
        @PathParam("id") id: Long
    ): ApiResponse<MemberProfileResponse> {
        val profile = memberService.getMemberProfile(id)
        return ApiResponse.success(profile)
    }

    @DELETE
    @Path("/me")
    @Operation(summary = "회원 탈퇴", description = "로그인한 회원의 계정을 탈퇴 처리합니다. 개인정보는 익명화되며 복구할 수 없습니다.")
    @APIResponses(
        APIResponse(responseCode = "200", description = "탈퇴 성공"),
        APIResponse(responseCode = "401", description = "인증 필요")
    )
    fun withdrawMember(): ApiResponse<Unit> {
        val memberId = getCurrentMemberId()
        memberService.withdrawMember(memberId)
        return ApiResponse.success(Unit)
    }
}
