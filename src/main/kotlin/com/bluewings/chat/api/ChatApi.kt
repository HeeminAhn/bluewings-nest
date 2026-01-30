package com.bluewings.chat.api

/**
 * Chat 모듈의 공개 API
 */
interface ChatApi {
    /**
     * 회원을 채팅에서 강제 퇴장
     */
    fun kickMember(memberId: Long)

    /**
     * 현재 접속 중인 회원 수
     */
    fun getOnlineCount(): Int

    /**
     * 회원이 현재 채팅에 접속 중인지 확인
     */
    fun isOnline(memberId: Long): Boolean

    /**
     * 시스템 메시지 전송
     */
    fun sendSystemMessage(message: String)

    /**
     * 회원 탈퇴 시 메시지 익명화
     */
    fun anonymizeMemberMessages(memberId: Long)
}
