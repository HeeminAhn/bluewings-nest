package com.bluewings.notice.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.common.exception.ErrorCode
import com.bluewings.common.service.FileUploadService
import com.bluewings.member.domain.MemberRole
import com.bluewings.notice.domain.Notice
import com.bluewings.notice.domain.NoticeImage
import com.bluewings.notice.dto.response.NoticeResponse
import com.bluewings.notice.repository.NoticeImageRepository
import com.bluewings.notice.repository.NoticeRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class NoticeCommandHandler(
    private val noticeRepository: NoticeRepository,
    private val noticeImageRepository: NoticeImageRepository,
    private val memberRepository: MemberRepository,
    private val fileUploadService: FileUploadService
) {
    @Transactional
    fun handle(command: CreateNoticeCommand): NoticeResponse {
        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (member.role != MemberRole.ADMIN) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        val notice = Notice(
            member = member,
            title = command.title,
            content = command.content,
            isPinned = command.isPinned
        )
        noticeRepository.persist(notice)

        command.images.forEachIndexed { index, imageData ->
            val noticeImage = NoticeImage(
                notice = notice,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            noticeImageRepository.persist(noticeImage)
            notice.images.add(noticeImage)
        }

        return NoticeResponse.from(notice)
    }

    @Transactional
    fun handle(command: UpdateNoticeCommand): NoticeResponse {
        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (member.role != MemberRole.ADMIN) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        val notice = noticeRepository.findById(command.noticeId)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)

        notice.update(command.title, command.content, command.isPinned)

        // 기존 이미지 파일 삭제 후 컬렉션 클리어 (orphanRemoval이 DB 삭제 처리)
        notice.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }
        notice.images.clear()

        command.images.forEachIndexed { index, imageData ->
            val noticeImage = NoticeImage(
                notice = notice,
                fileName = imageData.fileName,
                originalName = imageData.originalName,
                filePath = imageData.filePath,
                fileSize = imageData.fileSize,
                contentType = imageData.contentType,
                displayOrder = index
            )
            noticeImageRepository.persist(noticeImage)
            notice.images.add(noticeImage)
        }

        return NoticeResponse.from(notice)
    }

    @Transactional
    fun handle(command: DeleteNoticeCommand) {
        val member = memberRepository.findById(command.memberId)
            ?: throw BusinessException(ErrorCode.MEMBER_NOT_FOUND)

        if (member.role != MemberRole.ADMIN) {
            throw BusinessException(ErrorCode.FORBIDDEN)
        }

        val notice = noticeRepository.findById(command.noticeId)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)

        // 이미지 파일 삭제 (cascade가 DB 삭제 처리)
        notice.images.forEach { image ->
            fileUploadService.deleteFile(image.filePath)
        }

        noticeRepository.delete(notice)
    }

    @Transactional
    fun handle(command: IncrementNoticeViewCountCommand) {
        val notice = noticeRepository.findById(command.noticeId)
            ?: throw BusinessException(ErrorCode.NOTICE_NOT_FOUND)
        notice.incrementViewCount()
    }
}
