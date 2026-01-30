package com.bluewings.member.dto.response

import java.time.LocalDate

data class AttendanceResponse(
    val attendanceCount: Int,
    val lastAttendanceDate: LocalDate,
    val earnedPoints: Int,
    val totalPoints: Int,
    val message: String,
    val fortuneCookie: FortuneCookieResponse?
)

data class FortuneCookieResponse(
    val message: String,
    val category: String
)
