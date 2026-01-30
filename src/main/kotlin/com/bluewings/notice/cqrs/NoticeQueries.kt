package com.bluewings.notice.cqrs

data class GetNoticeByIdQuery(
    val noticeId: Long
)

data class GetNoticesPagedQuery(
    val page: Int = 0,
    val size: Int = 20
)

data class SearchNoticesQuery(
    val keyword: String,
    val page: Int = 0,
    val size: Int = 20
)

class GetPinnedNoticesQuery
