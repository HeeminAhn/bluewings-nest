package com.bluewings.member.repository

import com.bluewings.member.domain.MemberActivityStats
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class MemberActivityStatsRepository : PanacheRepository<MemberActivityStats> {

    fun findByMemberId(memberId: Long): MemberActivityStats? {
        return find("member.id", memberId).firstResult()
    }
}
