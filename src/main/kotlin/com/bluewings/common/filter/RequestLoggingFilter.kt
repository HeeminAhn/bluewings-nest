package com.bluewings.common.filter

import jakarta.ws.rs.container.ContainerRequestContext
import jakarta.ws.rs.container.ContainerRequestFilter
import jakarta.ws.rs.container.ContainerResponseContext
import jakarta.ws.rs.container.ContainerResponseFilter
import jakarta.ws.rs.ext.Provider
import org.jboss.logging.Logger

@Provider
class RequestLoggingFilter : ContainerRequestFilter, ContainerResponseFilter {

    private val log = Logger.getLogger(RequestLoggingFilter::class.java)

    companion object {
        private const val START_TIME = "request-start-time"
        private const val REQUEST_ID = "request-id"
    }

    override fun filter(requestContext: ContainerRequestContext) {
        val requestId = java.util.UUID.randomUUID().toString().substring(0, 8)
        requestContext.setProperty(REQUEST_ID, requestId)
        requestContext.setProperty(START_TIME, System.currentTimeMillis())

        val method = requestContext.method
        val path = requestContext.uriInfo.requestUri.path
        val query = requestContext.uriInfo.requestUri.query ?: ""
        val clientIp = getClientIp(requestContext)

        // 헬스체크, 정적 리소스는 로깅 제외
        if (shouldSkipLogging(path)) {
            return
        }

        log.infof("[%s] --> %s %s%s from %s",
            requestId,
            method,
            path,
            if (query.isNotEmpty()) "?$query" else "",
            clientIp
        )
    }

    override fun filter(requestContext: ContainerRequestContext, responseContext: ContainerResponseContext) {
        val path = requestContext.uriInfo.requestUri.path

        // 헬스체크, 정적 리소스는 로깅 제외
        if (shouldSkipLogging(path)) {
            return
        }

        val requestId = requestContext.getProperty(REQUEST_ID) as? String ?: "unknown"
        val startTime = requestContext.getProperty(START_TIME) as? Long ?: System.currentTimeMillis()
        val duration = System.currentTimeMillis() - startTime
        val status = responseContext.status
        val method = requestContext.method

        val logLevel = when {
            status >= 500 -> "ERROR"
            status >= 400 -> "WARN"
            else -> "INFO"
        }

        val message = String.format("[%s] <-- %s %s %d (%d ms)",
            requestId,
            method,
            path,
            status,
            duration
        )

        when (logLevel) {
            "ERROR" -> log.error(message)
            "WARN" -> log.warn(message)
            else -> log.info(message)
        }
    }

    private fun getClientIp(requestContext: ContainerRequestContext): String {
        return requestContext.getHeaderString("CF-Connecting-IP")
            ?: requestContext.getHeaderString("X-Forwarded-For")?.split(",")?.firstOrNull()?.trim()
            ?: requestContext.getHeaderString("X-Real-IP")
            ?: "unknown"
    }

    private fun shouldSkipLogging(path: String): Boolean {
        return path.startsWith("/q/health") ||
               path.startsWith("/q/metrics") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/openapi") ||
               path == "/favicon.ico"
    }
}
