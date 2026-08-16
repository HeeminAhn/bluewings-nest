package com.bluewings.member.cqrs

import io.quarkus.test.TestTransaction
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

@QuarkusTest
class MemberCqrsHandlerTest {

    @Inject
    lateinit var commandHandler: MemberCommandHandler

    @Inject
    lateinit var queryHandler: MemberQueryHandler

    @Test
    @TestTransaction
    fun `signUp 커맨드로 가입하면 QueryHandler로 동일한 회원을 조회할 수 있다`() {
        val memberId = commandHandler.handle(
            SignUpCommand(
                email = "cqrs-move-test@bluewings.com",
                password = "password123!",
                nickname = "cqrs이동테스트"
            )
        )

        val member = queryHandler.handle(GetMemberByIdQuery(memberId))

        assertEquals("cqrs이동테스트", member.nickname)
        assertTrue(queryHandler.handle(CheckEmailAvailableQuery("cqrs-move-test@bluewings.com")).not())
    }
}
