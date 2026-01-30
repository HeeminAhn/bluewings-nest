package com.bluewings.common.response

import com.bluewings.common.exception.ErrorCode
import java.time.Instant

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: ErrorDetail?,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> success(data: T): ApiResponse<T> = ApiResponse(
            success = true,
            data = data,
            error = null
        )

        fun <T> success(): ApiResponse<T> = ApiResponse(
            success = true,
            data = null,
            error = null
        )

        fun <T> error(errorCode: ErrorCode, message: String = errorCode.message): ApiResponse<T> = ApiResponse(
            success = false,
            data = null,
            error = ErrorDetail(errorCode.code, message)
        )
    }
}

data class ErrorDetail(
    val code: String,
    val message: String
)
