package com.bluewings.common.security

import io.smallrye.jwt.auth.principal.JWTParser
import io.smallrye.jwt.build.Jwt
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.config.inject.ConfigProperty
import org.eclipse.microprofile.jwt.JsonWebToken
import java.time.Duration
import java.time.Instant

@ApplicationScoped
class JwtService(
    @param:ConfigProperty(name = "mp.jwt.verify.issuer")
    private val issuer: String,

    @param:ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "1800")
    private val tokenLifespan: Long,

    @param:ConfigProperty(name = "app.jwt.refresh-token-lifespan", defaultValue = "604800")
    private val refreshTokenLifespan: Long,

    private val jwtParser: JWTParser
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
            .claim("memberId", memberId)
            .groups(setOf(role))
            .expiresIn(Duration.ofSeconds(refreshTokenLifespan))
            .sign()
    }

    fun getAccessTokenLifespan(): Long = tokenLifespan

    fun getRefreshTokenLifespan(): Long = refreshTokenLifespan

    fun getRefreshTokenExpiration(): Instant {
        return Instant.now().plusSeconds(refreshTokenLifespan)
    }

    fun validateRefreshToken(token: String): Long? {
        return try {
            val jwt: JsonWebToken = jwtParser.parse(token)
            val tokenType = jwt.getClaim<String>("type")
            if (tokenType != "refresh") {
                return null
            }
            jwt.getClaim<Long>("memberId")
        } catch (e: Exception) {
            null
        }
    }
}
