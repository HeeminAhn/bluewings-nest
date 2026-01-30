package com.bluewings.member.internal

import com.bluewings.community.api.*
import com.bluewings.member.repository.MemberActivityStatsRepository
import com.bluewings.member.repository.MemberRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.event.Observes
import jakarta.transaction.Transactional
import org.jboss.logging.Logger

/**
 * Member 모듈에서 Community 이벤트를 처리하는 핸들러
 * 게시글/댓글/좋아요 활동에 따른 회원 통계 업데이트
 */
@ApplicationScoped
class CommunityEventHandler(
    private val activityStatsRepository: MemberActivityStatsRepository,
    private val memberRepository: MemberRepository
) {
    private val log = Logger.getLogger(CommunityEventHandler::class.java)

    /**
     * 게시글 작성 시 활동 통계 증가
     */
    @Transactional
    fun onPostCreated(@Observes event: PostCreatedEvent) {
        log.debug("Handling PostCreatedEvent for memberId: ${event.authorId}")
        updateActivityAndGrade(event.authorId) { stats ->
            stats.incrementPostCount()
        }
    }

    /**
     * 게시글 삭제 시 활동 통계 감소
     */
    @Transactional
    fun onPostDeleted(@Observes event: PostDeletedEvent) {
        log.debug("Handling PostDeletedEvent for memberId: ${event.authorId}")
        updateActivityAndGrade(event.authorId) { stats ->
            stats.decrementPostCount()
        }
    }

    /**
     * 댓글 작성 시 활동 통계 증가
     */
    @Transactional
    fun onCommentCreated(@Observes event: CommentCreatedEvent) {
        log.debug("Handling CommentCreatedEvent for memberId: ${event.authorId}")
        updateActivityAndGrade(event.authorId) { stats ->
            stats.incrementCommentCount()
        }
    }

    /**
     * 댓글 삭제 시 활동 통계 감소
     */
    @Transactional
    fun onCommentDeleted(@Observes event: CommentDeletedEvent) {
        log.debug("Handling CommentDeletedEvent for memberId: ${event.authorId}")
        updateActivityAndGrade(event.authorId) { stats ->
            stats.decrementCommentCount()
        }
    }

    /**
     * 좋아요 토글 시 활동 통계 업데이트
     */
    @Transactional
    fun onPostLikeToggled(@Observes event: PostLikeToggledEvent) {
        log.debug("Handling PostLikeToggledEvent for memberId: ${event.memberId}, isLiked: ${event.isLiked}")
        updateActivityAndGrade(event.memberId) { stats ->
            if (event.isLiked) {
                stats.incrementLikeCount()
            } else {
                stats.decrementLikeCount()
            }
        }
    }

    /**
     * 활동 통계 업데이트 및 등급 재계산
     */
    private fun updateActivityAndGrade(memberId: Long, updateAction: (com.bluewings.member.domain.MemberActivityStats) -> Unit) {
        val stats = activityStatsRepository.findByMemberId(memberId)
        if (stats != null) {
            updateAction(stats)

            // 등급 재계산
            val member = memberRepository.findById(memberId)
            member?.updateGrade(stats.calculateTotalPoints())
        }
    }
}
