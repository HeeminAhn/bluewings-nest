package com.bluewings.chat.cqrs

import com.bluewings.member.domain.Member
import com.bluewings.member.repository.MemberRepository
import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

@QuarkusTest
class ChatCqrsHandlerTest {

    @Inject
    lateinit var commandHandler: ChatCommandHandler

    @Inject
    lateinit var queryHandler: ChatQueryHandler

    @Inject
    lateinit var memberRepository: MemberRepository

    @Test
    @TestTransaction
    fun `정상 메시지를 보내면 SUCCESS와 함께 응답을 반환하고 히스토리에서 조회된다`() {
        val member = Member(email = "chat-sender@bluewings.com", password = "x", nickname = "채팅유저")
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "안녕하세요"))

        assertEquals(SendMessageResult.SUCCESS, outcome.result)
        assertEquals("안녕하세요", outcome.response?.content)

        val history = queryHandler.handle(GetChatHistoryQuery())
        assertTrue(history.messages.any { it.content == "안녕하세요" })
    }

    @Test
    @TestTransaction
    fun `차단된 회원이 메시지를 보내면 MEMBER_BLOCKED를 반환한다`() {
        val member = Member(
            email = "chat-blocked@bluewings.com",
            password = "x",
            nickname = "차단유저",
            isBlocked = true
        )
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "메시지"))

        assertEquals(SendMessageResult.MEMBER_BLOCKED, outcome.result)
    }

    @Test
    @TestTransaction
    fun `빈 내용이면 INVALID_CONTENT를 반환한다`() {
        val member = Member(email = "chat-empty@bluewings.com", password = "x", nickname = "빈메시지유저")
        memberRepository.persist(member)

        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, "   "))

        assertEquals(SendMessageResult.INVALID_CONTENT, outcome.result)
    }

    @Test
    @TestTransaction
    fun `trim하면 1000자 이하지만 원본 길이가 1000자를 초과하면 INVALID_CONTENT를 반환한다`() {
        val member = Member(email = "chat-boundary-over@bluewings.com", password = "x", nickname = "경계초과유저")
        memberRepository.persist(member)

        val paddedContent = " " + "a".repeat(999) + " " // raw length 1001, trimmed length 999
        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, paddedContent))

        assertEquals(SendMessageResult.INVALID_CONTENT, outcome.result)
    }

    @Test
    @TestTransaction
    fun `정확히 1000자면 SUCCESS를 반환한다`() {
        val member = Member(email = "chat-boundary-exact@bluewings.com", password = "x", nickname = "경계일치유저")
        memberRepository.persist(member)

        val exactContent = "a".repeat(1000)
        val outcome = commandHandler.handle(SendMessageCommand(member.id!!, exactContent))

        assertEquals(SendMessageResult.SUCCESS, outcome.result)
        assertEquals(exactContent, outcome.response?.content)
    }
}
