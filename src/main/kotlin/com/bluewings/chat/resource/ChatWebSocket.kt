package com.bluewings.chat.resource

import com.bluewings.chat.cqrs.ChatCommandHandler
import com.bluewings.chat.cqrs.SendMessageCommand
import com.bluewings.chat.cqrs.SendMessageResult
import com.bluewings.chat.dto.request.ChatMessageRequest
import com.bluewings.chat.dto.response.ChatBroadcastMessage
import com.bluewings.member.repository.MemberRepository
import com.fasterxml.jackson.databind.ObjectMapper
import io.quarkus.arc.Arc
import io.quarkus.websockets.next.*
import io.smallrye.common.annotation.Blocking
import io.smallrye.jwt.auth.principal.JWTParser
import io.smallrye.jwt.auth.principal.ParseException
import jakarta.enterprise.context.control.ActivateRequestContext
import jakarta.inject.Inject
import jakarta.transaction.Transactional
import java.util.concurrent.ConcurrentHashMap

@WebSocket(path = "/ws/chat")
class ChatWebSocket {

    @Inject
    lateinit var memberRepository: MemberRepository

    @Inject
    lateinit var chatCommandHandler: ChatCommandHandler

    @Inject
    lateinit var objectMapper: ObjectMapper

    @Inject
    lateinit var jwtParser: JWTParser

    companion object {
        private val connections = ConcurrentHashMap<String, WebSocketConnection>()
        private val connectionMembers = ConcurrentHashMap<String, Long>()
        private val connectionNicknames = ConcurrentHashMap<String, String>()
        private val memberConnections = ConcurrentHashMap<Long, String>() // memberId -> connectionId

        /**
         * 특정 회원을 채팅에서 강제 퇴장시킵니다.
         */
        fun kickMember(memberId: Long) {
            val connectionId = memberConnections[memberId] ?: return
            val connection = connections[connectionId] ?: return
            val nickname = connectionNicknames[connectionId]

            // 연결 정리
            connections.remove(connectionId)
            connectionMembers.remove(connectionId)
            connectionNicknames.remove(connectionId)
            memberConnections.remove(memberId)

            // 연결 종료
            try {
                connection.close()
            } catch (e: Exception) {
                // ignore
            }

            // 퇴장 알림 브로드캐스트
            if (nickname != null) {
                val objectMapper = Arc.container().instance(ObjectMapper::class.java).get()
                val leaveMessage = ChatBroadcastMessage(
                    type = "LEAVE",
                    nickname = nickname,
                    onlineCount = connectionMembers.values.toSet().size
                )
                connections.values.forEach { conn ->
                    try {
                        conn.sendTextAndAwait(objectMapper.writeValueAsString(leaveMessage))
                    } catch (e: Exception) {
                        // ignore
                    }
                }
            }
        }
    }

    private fun getUniqueUserCount(): Int {
        return connectionMembers.values.toSet().size
    }

    @OnOpen
    @Blocking
    @ActivateRequestContext
    fun onOpen(connection: WebSocketConnection) {
        // 쿼리 파라미터에서 토큰 추출
        val token = connection.handshakeRequest().query()?.let { query ->
            query.split("&").find { it.startsWith("token=") }?.removePrefix("token=")
        }

        if (token.isNullOrBlank()) {
            connection.close()
            return
        }

        // JWT 파싱 및 memberId 추출
        val memberId = try {
            val jwt = jwtParser.parse(token)
            jwt.subject?.toLongOrNull()
        } catch (e: ParseException) {
            null
        }

        if (memberId == null) {
            connection.close()
            return
        }

        val member = memberRepository.findById(memberId)
        if (member == null || member.isBlocked) {
            connection.close()
            return
        }

        // 같은 사용자의 기존 연결이 있으면 정리
        val oldConnectionId = memberConnections[memberId]
        if (oldConnectionId != null) {
            connections.remove(oldConnectionId)
            connectionMembers.remove(oldConnectionId)
            connectionNicknames.remove(oldConnectionId)
        }

        connections[connection.id()] = connection
        connectionMembers[connection.id()] = memberId
        connectionNicknames[connection.id()] = member.nickname
        memberConnections[memberId] = connection.id()

        // 입장 알림 브로드캐스트 (새로운 사용자인 경우만)
        if (oldConnectionId == null) {
            val joinMessage = ChatBroadcastMessage(
                type = "JOIN",
                nickname = member.nickname,
                onlineCount = getUniqueUserCount()
            )
            broadcast(objectMapper.writeValueAsString(joinMessage))
        } else {
            // 재접속인 경우 현재 사용자 수만 업데이트
            val updateMessage = ChatBroadcastMessage(
                type = "JOIN",
                nickname = null,
                onlineCount = getUniqueUserCount()
            )
            // 본인에게만 전송
            try {
                connection.sendTextAndAwait(objectMapper.writeValueAsString(updateMessage))
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    @OnTextMessage
    @Blocking
    @ActivateRequestContext
    @Transactional
    fun onMessage(connection: WebSocketConnection, message: String) {
        val memberId = connectionMembers[connection.id()] ?: return

        val request = try {
            objectMapper.readValue(message, ChatMessageRequest::class.java)
        } catch (e: Exception) {
            return
        }

        val outcome = chatCommandHandler.handle(SendMessageCommand(memberId, request.content))

        when (outcome.result) {
            SendMessageResult.MEMBER_BLOCKED -> connection.close()
            SendMessageResult.MEMBER_NOT_FOUND, SendMessageResult.INVALID_CONTENT -> return
            SendMessageResult.SUCCESS -> {
                val broadcastMessage = ChatBroadcastMessage(
                    type = "MESSAGE",
                    message = outcome.response
                )
                broadcast(objectMapper.writeValueAsString(broadcastMessage))
            }
        }
    }

    @OnClose
    @Blocking
    fun onClose(connection: WebSocketConnection) {
        val memberId = connectionMembers.remove(connection.id())
        val nickname = connectionNicknames.remove(connection.id())
        connections.remove(connection.id())

        // memberConnections에서 현재 연결이 해당 멤버의 활성 연결인 경우에만 제거
        if (memberId != null && memberConnections[memberId] == connection.id()) {
            memberConnections.remove(memberId)

            if (nickname != null) {
                val leaveMessage = ChatBroadcastMessage(
                    type = "LEAVE",
                    nickname = nickname,
                    onlineCount = getUniqueUserCount()
                )
                broadcast(objectMapper.writeValueAsString(leaveMessage))
            }
        }
    }

    private fun broadcast(message: String) {
        connections.values.forEach { conn ->
            try {
                conn.sendTextAndAwait(message)
            } catch (e: Exception) {
                // 연결 실패 시 무시
            }
        }
    }
}
