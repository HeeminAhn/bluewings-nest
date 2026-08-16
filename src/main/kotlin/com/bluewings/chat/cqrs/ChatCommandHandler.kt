package com.bluewings.chat.cqrs

import com.bluewings.chat.domain.ChatMessage
import com.bluewings.chat.dto.response.ChatMessageResponse
import com.bluewings.chat.repository.ChatMessageRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class ChatCommandHandler(
    private val chatMessageRepository: ChatMessageRepository,
    private val memberRepository: MemberRepository
) {
    companion object {
        private const val MAX_CONTENT_LENGTH = 1000
    }

    @Transactional
    fun handle(command: SendMessageCommand): SendMessageOutcome {
        val member = memberRepository.findById(command.memberId)
            ?: return SendMessageOutcome(SendMessageResult.MEMBER_NOT_FOUND)

        if (member.isBlocked) {
            return SendMessageOutcome(SendMessageResult.MEMBER_BLOCKED)
        }

        if (command.content.isBlank() || command.content.length > MAX_CONTENT_LENGTH) {
            return SendMessageOutcome(SendMessageResult.INVALID_CONTENT)
        }

        val content = command.content.trim()
        val chatMessage = ChatMessage(member = member, content = content)
        chatMessageRepository.persist(chatMessage)

        val response = ChatMessageResponse(
            id = chatMessage.id!!,
            memberId = member.id!!,
            nickname = member.nickname,
            profileImageUrl = member.profileImageUrl,
            grade = member.grade.name,
            content = chatMessage.content,
            createdAt = chatMessage.createdAt
        )

        return SendMessageOutcome(SendMessageResult.SUCCESS, response)
    }
}
