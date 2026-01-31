package com.bluewings.common.exception

import com.bluewings.common.response.ApiResponse
import jakarta.validation.ConstraintViolationException
import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.ExceptionMapper
import jakarta.ws.rs.ext.Provider
import org.jboss.logging.Logger

@Provider
class BusinessExceptionHandler : ExceptionMapper<BusinessException> {
    private val log = Logger.getLogger(BusinessExceptionHandler::class.java)

    override fun toResponse(exception: BusinessException): Response {
        log.warn("Business exception: ${exception.errorCode.code} - ${exception.message}")
        return Response.status(exception.errorCode.status)
            .entity(ApiResponse.error<Unit>(exception.errorCode, exception.message))
            .build()
    }
}

@Provider
class ConstraintViolationExceptionHandler : ExceptionMapper<ConstraintViolationException> {
    private val log = Logger.getLogger(ConstraintViolationExceptionHandler::class.java)

    override fun toResponse(exception: ConstraintViolationException): Response {
        val messages = exception.constraintViolations.joinToString(", ") { it.message }
        log.warn("Validation exception: $messages")
        return Response.status(Response.Status.BAD_REQUEST)
            .entity(ApiResponse.error<Unit>(ErrorCode.INVALID_INPUT, messages))
            .build()
    }
}

@Provider
class WebApplicationExceptionHandler : ExceptionMapper<WebApplicationException> {
    override fun toResponse(exception: WebApplicationException): Response {
        // JAX-RS 표준 예외는 원래 응답을 그대로 반환 (swagger-ui, 404 등)
        return exception.response
    }
}

@Provider
class GeneralExceptionHandler : ExceptionMapper<Exception> {
    private val log = Logger.getLogger(GeneralExceptionHandler::class.java)

    override fun toResponse(exception: Exception): Response {
        log.error("Unexpected exception", exception)
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity(ApiResponse.error<Unit>(ErrorCode.INTERNAL_ERROR))
            .build()
    }
}
