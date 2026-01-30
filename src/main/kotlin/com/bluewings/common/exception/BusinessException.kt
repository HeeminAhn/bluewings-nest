package com.bluewings.common.exception

open class BusinessException(
    val errorCode: ErrorCode,
    override val message: String = errorCode.message
) : RuntimeException(message)

class EmailDuplicatedException : BusinessException(ErrorCode.EMAIL_DUPLICATED)
class NicknameDuplicatedException : BusinessException(ErrorCode.NICKNAME_DUPLICATED)
class InvalidCredentialsException : BusinessException(ErrorCode.INVALID_CREDENTIALS)
class MemberNotFoundException : BusinessException(ErrorCode.MEMBER_NOT_FOUND)
class AlreadyAttendedException : BusinessException(ErrorCode.ALREADY_ATTENDED_TODAY)

