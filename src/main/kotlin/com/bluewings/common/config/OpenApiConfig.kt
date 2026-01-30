package com.bluewings.common.config

import jakarta.ws.rs.core.Application
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType
import org.eclipse.microprofile.openapi.annotations.info.Contact
import org.eclipse.microprofile.openapi.annotations.info.Info
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme
import org.eclipse.microprofile.openapi.annotations.servers.Server

@OpenAPIDefinition(
    info = Info(
        title = "Bluewings Nest API",
        version = "1.0.0",
        description = "블루윙즈 팬 커뮤니티 API",
        contact = Contact(name = "Bluewings Nest Team")
    ),
    servers = [
        Server(url = "http://localhost:8080", description = "Development Server")
    ]
)
@SecurityScheme(
    securitySchemeName = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT 인증 토큰을 입력하세요"
)
class OpenApiConfig : Application()
