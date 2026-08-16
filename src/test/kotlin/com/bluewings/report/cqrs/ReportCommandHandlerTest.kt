package com.bluewings.report.cqrs

import com.bluewings.common.exception.BusinessException
import com.bluewings.member.domain.Member
import com.bluewings.member.repository.MemberRepository
import com.bluewings.report.domain.ReportReason
import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

@QuarkusTest
class ReportCommandHandlerTest {

    @Inject
    lateinit var commandHandler: ReportCommandHandler

    @Inject
    lateinit var memberRepository: MemberRepository

    @Test
    @TestTransaction
    fun `정상적인 신고는 신고 ID를 반환한다`() {
        val reporter = Member(email = "report-reporter@bluewings.com", password = "x", nickname = "신고자")
        val reported = Member(email = "report-reported@bluewings.com", password = "x", nickname = "피신고자")
        memberRepository.persist(reporter)
        memberRepository.persist(reported)

        val reportId = commandHandler.handle(
            CreateReportCommand(
                reporterId = reporter.id!!,
                reportedMemberId = reported.id!!,
                reason = ReportReason.SPAM,
                description = "테스트 신고",
                contentType = null,
                contentId = null
            )
        )

        assertNotNull(reportId)
    }

    @Test
    @TestTransaction
    fun `자기 자신을 신고하면 예외가 발생한다`() {
        val member = Member(email = "report-self@bluewings.com", password = "x", nickname = "본인")
        memberRepository.persist(member)

        val exception = assertThrows(BusinessException::class.java) {
            commandHandler.handle(
                CreateReportCommand(
                    reporterId = member.id!!,
                    reportedMemberId = member.id!!,
                    reason = ReportReason.OTHER,
                    description = null,
                    contentType = null,
                    contentId = null
                )
            )
        }

        assertEquals("R003", exception.errorCode.code)
    }
}
