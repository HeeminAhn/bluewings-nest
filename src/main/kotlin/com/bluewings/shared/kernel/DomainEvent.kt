package com.bluewings.shared.kernel

import java.time.Instant
import java.util.UUID

/**
 * 모든 도메인 이벤트의 기본 인터페이스
 */
interface DomainEvent {
    val eventId: String
    val occurredAt: Instant
    val aggregateId: Long
}

/**
 * 도메인 이벤트 기본 구현
 */
abstract class BaseDomainEvent(
    override val aggregateId: Long
) : DomainEvent {
    override val eventId: String = UUID.randomUUID().toString()
    override val occurredAt: Instant = Instant.now()
}
