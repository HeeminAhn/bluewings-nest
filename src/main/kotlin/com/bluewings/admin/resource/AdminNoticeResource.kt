package com.bluewings.admin.resource

import com.bluewings.admin.dto.request.AdminCreateNoticeRequest
import com.bluewings.admin.dto.request.AdminUpdateNoticeRequest
import com.bluewings.admin.dto.response.AdminNoticeResponse
import com.bluewings.admin.dto.response.PagedResponse
import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.pagination.PageParams
import com.bluewings.common.response.ApiResponse
import com.bluewings.member.repository.MemberRepository
import com.bluewings.notice.domain.Notice
import com.bluewings.notice.domain.NoticeImage
import com.bluewings.notice.repository.NoticeImageRepository
import com.bluewings.notice.repository.NoticeRepository
import io.quarkus.panache.common.Page
import io.quarkus.panache.common.Sort
import jakarta.annotation.security.RolesAllowed
import jakarta.transaction.Transactional
import jakarta.validation.Valid
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import org.eclipse.microprofile.jwt.JsonWebToken
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.tags.Tag
import java.time.LocalDate
import java.time.LocalDateTime

@Path("/api/admin/notices")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Admin Notice", description = "공지사항 관리 API")
@RolesAllowed("ADMIN")
class AdminNoticeResource(
    private val noticeRepository: NoticeRepository,
    private val noticeImageRepository: NoticeImageRepository,
    private val memberRepository: MemberRepository,
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
    @Operation(summary = "공지사항 목록 조회", description = "페이지네이션된 공지사항 목록을 조회합니다")
    fun getNotices(
        @Valid @BeanParam pageParams: PageParams,
        @QueryParam("keyword") keyword: String?,
        @QueryParam("authorNickname") authorNickname: String?,
        @QueryParam("startDate") startDate: LocalDate?,
        @QueryParam("endDate") endDate: LocalDate?
    ): ApiResponse<PagedResponse<AdminNoticeResponse>> {
        val page = pageParams.page
        val size = pageParams.size

        val result = noticeRepository.findWithFilters(
            keyword = keyword,
            authorNickname = authorNickname,
            startDate = startDate?.atStartOfDay(),
            endDate = endDate?.plusDays(1)?.atStartOfDay(),
            page = page,
            size = size
        )

        val response = PagedResponse(
            content = result.first.map { AdminNoticeResponse.from(it) },
            totalElements = result.second,
            totalPages = ((result.second + size - 1) / size).toInt(),
            page = page,
            size = size
        )

        return ApiResponse.success(response)
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "공지사항 상세 조회", description = "공지사항 상세 정보를 조회합니다")
    fun getNotice(@PathParam("id") id: Long): ApiResponse<AdminNoticeResponse> {
        val notice = noticeRepository.findById(id)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)

        return ApiResponse.success(AdminNoticeResponse.from(notice))
    }

    @POST
    @Transactional
    @Operation(summary = "공지사항 생성", description = "새로운 공지사항을 생성합니다")
    fun createNotice(@Valid request: AdminCreateNoticeRequest): ApiResponse<AdminNoticeResponse> {
        val member = memberRepository.findById(getCurrentMemberId())
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        val notice = Notice(
            title = request.title,
            content = request.content,
            isPinned = request.isPinned,
            member = member
        )

        noticeRepository.persist(notice)

        // 이미지 저장
        request.images.forEach { imageRequest ->
            val noticeImage = NoticeImage(
                notice = notice,
                fileName = imageRequest.fileName,
                originalName = imageRequest.originalName,
                filePath = imageRequest.filePath,
                fileSize = imageRequest.fileSize,
                contentType = imageRequest.contentType
            )
            noticeImageRepository.persist(noticeImage)
            notice.images.add(noticeImage)
        }

        return ApiResponse.success(AdminNoticeResponse.from(notice))
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "공지사항 수정", description = "공지사항을 수정합니다")
    fun updateNotice(
        @PathParam("id") id: Long,
        @Valid request: AdminUpdateNoticeRequest
    ): ApiResponse<AdminNoticeResponse> {
        val notice = noticeRepository.findById(id)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)

        request.title?.let { notice.title = it }
        request.content?.let { notice.content = it }
        request.isPinned?.let { notice.isPinned = it }
        notice.updatedAt = LocalDateTime.now()

        // 이미지 업데이트 (있는 경우)
        request.images?.let { newImages ->
            // 기존 이미지 삭제
            noticeImageRepository.deleteByNoticeId(notice.id)
            notice.images.clear()

            // 새 이미지 추가
            newImages.forEach { imageRequest ->
                val noticeImage = NoticeImage(
                    notice = notice,
                    fileName = imageRequest.fileName,
                    originalName = imageRequest.originalName,
                    filePath = imageRequest.filePath,
                    fileSize = imageRequest.fileSize,
                    contentType = imageRequest.contentType
                )
                noticeImageRepository.persist(noticeImage)
                notice.images.add(noticeImage)
            }
        }

        noticeRepository.persist(notice)

        return ApiResponse.success(AdminNoticeResponse.from(notice))
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다")
    fun deleteNotice(@PathParam("id") id: Long): ApiResponse<Unit> {
        val notice = noticeRepository.findById(id)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)

        noticeImageRepository.deleteByNoticeId(id)
        noticeRepository.delete(notice)

        return ApiResponse.success(Unit)
    }
}
