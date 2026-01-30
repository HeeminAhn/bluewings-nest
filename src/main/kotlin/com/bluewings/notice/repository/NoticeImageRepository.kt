package com.bluewings.notice.repository

import com.bluewings.notice.domain.NoticeImage
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped
import jakarta.transaction.Transactional

@ApplicationScoped
class NoticeImageRepository : PanacheRepository<NoticeImage> {

    fun findByNoticeId(noticeId: Long): List<NoticeImage> {
        return find("notice.id", noticeId).list()
    }

    @Transactional
    fun deleteByNoticeId(noticeId: Long): Long {
        return delete("notice.id", noticeId)
    }
}
