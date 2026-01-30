package com.bluewings.community.internal

import com.bluewings.member.api.MemberBlockedEvent
import com.bluewings.member.api.MemberWithdrawnEvent
import com.bluewings.community.repository.CommentRepository
import com.bluewings.community.repository.PostRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.event.Observes
import jakarta.transaction.Transactional
import org.jboss.logging.Logger

/**
 * Community 모듈에서 Member 이벤트를 처리하는 핸들러
 */
@ApplicationScoped
class MemberEventHandler(
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository
) {
    private val log = Logger.getLogger(MemberEventHandler::class.java)

    /**
     * 회원 탈퇴 시 게시글/댓글의 작성자 정보 익명화
     */
    @Transactional
    fun onMemberWithdrawn(@Observes event: MemberWithdrawnEvent) {
        log.info("Handling MemberWithdrawnEvent for memberId: ${event.aggregateId}")

        // 게시글 익명화는 Member 엔티티 관계로 인해 자동 처리됨
        // 추가 처리가 필요한 경우 여기에 구현

        log.info("Member content anonymization completed for memberId: ${event.aggregateId}")
    }

    /**
     * 회원 차단 시 처리 (필요 시 게시글 숨김 등)
     */
    fun onMemberBlocked(@Observes event: MemberBlockedEvent) {
        log.info("Handling MemberBlockedEvent for memberId: ${event.aggregateId}")
        // 필요 시 차단된 회원의 게시글/댓글 숨김 처리
    }
}
