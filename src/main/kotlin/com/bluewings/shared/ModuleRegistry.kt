package com.bluewings.shared

import com.bluewings.chat.api.ChatApi
import com.bluewings.community.api.CommunityApi
import com.bluewings.match.api.MatchApi
import com.bluewings.member.api.MemberApi
import com.bluewings.notice.api.NoticeApi
import com.bluewings.report.api.ReportApi
import jakarta.enterprise.context.ApplicationScoped
import jakarta.enterprise.inject.Instance

/**
 * 모듈 API 레지스트리
 * 모든 모듈의 공개 API에 대한 중앙 접근점 제공
 *
 * 사용 예시:
 * ```
 * @Inject
 * lateinit var modules: ModuleRegistry
 *
 * fun example() {
 *     val memberInfo = modules.member.getMemberInfo(memberId)
 *     val postInfo = modules.community.getPostInfo(postId)
 * }
 * ```
 */
@ApplicationScoped
class ModuleRegistry(
    memberApi: Instance<MemberApi>,
    communityApi: Instance<CommunityApi>,
    chatApi: Instance<ChatApi>,
    noticeApi: Instance<NoticeApi>,
    matchApi: Instance<MatchApi>,
    reportApi: Instance<ReportApi>
) {
    val member: MemberApi = memberApi.get()
    val community: CommunityApi = communityApi.get()
    val chat: ChatApi = chatApi.get()
    val notice: NoticeApi = noticeApi.get()
    val match: MatchApi = matchApi.get()
    val report: ReportApi = reportApi.get()
}
