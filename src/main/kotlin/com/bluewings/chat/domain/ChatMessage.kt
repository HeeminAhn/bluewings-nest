package com.bluewings.chat.domain

import com.bluewings.member.domain.Member
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "chat_messages")
class ChatMessage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    val member: Member,

    @Column(nullable = false, length = 1000)
    val content: String,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
