package com.bluewings.common.security

import io.quarkus.elytron.security.common.BcryptUtil
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class PasswordEncoder {

    fun encode(rawPassword: String): String {
        return BcryptUtil.bcryptHash(rawPassword)
    }

    fun matches(rawPassword: String, encodedPassword: String): Boolean {
        return BcryptUtil.matches(rawPassword, encodedPassword)
    }
}
