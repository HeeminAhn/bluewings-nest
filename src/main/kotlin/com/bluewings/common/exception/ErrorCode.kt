package com.bluewings.common.exception

enum class ErrorCode(
    val status: Int,
    val code: String,
    val message: String
) {
    // Common
    INVALID_INPUT(400, "C001", "잘못된 입력값입니다"),
    INTERNAL_ERROR(500, "C002", "서버 내부 오류가 발생했습니다"),
    UNAUTHORIZED(401, "C003", "인증이 필요합니다"),
    FORBIDDEN(403, "C004", "접근 권한이 없습니다"),

    // Auth
    EMAIL_DUPLICATED(409, "A001", "이미 사용 중인 이메일입니다"),
    NICKNAME_DUPLICATED(409, "A002", "이미 사용 중인 닉네임입니다"),
    INVALID_CREDENTIALS(401, "A003", "이메일 또는 비밀번호가 올바르지 않습니다"),
    INVALID_TOKEN(401, "A004", "유효하지 않은 토큰입니다"),
    TOKEN_EXPIRED(401, "A005", "토큰이 만료되었습니다"),

    // Member
    MEMBER_NOT_FOUND(404, "M001", "회원을 찾을 수 없습니다"),
    ALREADY_ATTENDED_TODAY(400, "M002", "오늘은 이미 출석 체크를 완료했습니다"),
    INVALID_PASSWORD_FORMAT(400, "M003", "비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다"),

    // Post
    POST_NOT_FOUND(404, "P001", "게시글을 찾을 수 없습니다"),

    // Notice
    NOTICE_NOT_FOUND(404, "N001", "공지사항을 찾을 수 없습니다"),

    // Comment
    COMMENT_NOT_FOUND(404, "CM001", "댓글을 찾을 수 없습니다"),

    // File
    FILE_TOO_LARGE(400, "F001", "파일 크기가 너무 큽니다"),
    INVALID_FILE_TYPE(400, "F002", "지원하지 않는 파일 형식입니다"),
    FILE_UPLOAD_FAILED(500, "F003", "파일 업로드에 실패했습니다"),

    // Match
    MATCH_NOT_FOUND(404, "MA001", "경기를 찾을 수 없습니다"),

    // Chat
    CHAT_MESSAGE_NOT_FOUND(404, "CH001", "채팅 메시지를 찾을 수 없습니다"),

    // Report
    REPORT_NOT_FOUND(404, "R001", "신고를 찾을 수 없습니다"),
    ALREADY_REPORTED(400, "R002", "이미 신고한 콘텐츠입니다"),
    CANNOT_REPORT_SELF(400, "R003", "자신을 신고할 수 없습니다"),

    // Member Block
    MEMBER_BLOCKED(403, "MB001", "차단된 회원입니다"),

    // Category
    CATEGORY_NOT_FOUND(404, "CT001", "카테고리를 찾을 수 없습니다"),
    CATEGORY_NAME_DUPLICATED(409, "CT002", "이미 존재하는 카테고리명입니다")
}
