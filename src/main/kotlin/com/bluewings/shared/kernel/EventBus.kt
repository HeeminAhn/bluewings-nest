package com.bluewings.shared.kernel

import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.event.Event
import jakarta.enterprise.event.Observes
import org.jboss.logging.Logger

/**
 * 모듈 간 이벤트 통신을 위한 이벤트 버스
 * CDI Event를 래핑하여 모듈 간 느슨한 결합 제공
 */
@ApplicationScoped
class EventBus(
    private val event: Event<DomainEvent>
) {
    private val log = Logger.getLogger(EventBus::class.java)

    /**
     * 이벤트 발행
     */
    fun publish(domainEvent: DomainEvent) {
        log.debug("Publishing event: ${domainEvent::class.simpleName} [${domainEvent.eventId}]")
        event.fire(domainEvent)
    }

    /**
     * 여러 이벤트 일괄 발행
     */
    fun publishAll(events: List<DomainEvent>) {
        events.forEach { publish(it) }
    }
}

/**
 * 이벤트 핸들러 마커 인터페이스
 */
interface EventHandler<T : DomainEvent> {
    fun handle(event: T)
}
