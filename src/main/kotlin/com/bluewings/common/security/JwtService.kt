package com.bluewings.common.security

import io.smallrye.jwt.build.Jwt
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import java.time.Duration

@ApplicationScoped
class JwtService(
    @param:ConfigProperty(name = "mp.jwt.verify.issuer")
    private val issuer: String,

    @param:ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "86400")
    private val tokenLifespan: Long
) {

    fun generateToken(memberId: Long, email: String, nickname: String, role: String = "USER"): String {
        return Jwt.issuer(issuer)
            .subject(memberId.toString())
            .upn(email)
            .claim("nickname", nickname)
            .claim("memberId", memberId)
            .claim("role", role)
            .groups(setOf(role))
            .expiresIn(Duration.ofSeconds(tokenLifespan))
            .sign()
    }

    fun generateRefreshToken(memberId: Long, role: String = "USER"): String {
        return Jwt.issuer(issuer)
            .subject(memberId.toString())
            .claim("type", "refresh")
            .groups(setOf(role))
            .expiresIn(Duration.ofDays(7))
            .sign()
    }
}
