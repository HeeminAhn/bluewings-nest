package com.bluewings.member.repository

import com.bluewings.member.domain.Member
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class MemberRepository : PanacheRepository<Member> {

    fun findByEmail(email: String): Member? {
        return find("email", email).firstResult()
    }

    fun findByNickname(nickname: String): Member? {
        return find("nickname", nickname).firstResult()
    }

    fun existsByEmail(email: String): Boolean {
        return count("email", email) > 0
    }

    fun existsByNickname(nickname: String): Boolean {
        return count("nickname", nickname) > 0
    }

    fun findActiveById(id: Long): Member? {
        return find("id = ?1 and isActive = true", id).firstResult()
    }
}
