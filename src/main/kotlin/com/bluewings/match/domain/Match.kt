package com.bluewings.match.domain

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalTime
import java.time.Instant

enum class MatchStatus {
    SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
}

@Entity
@Table(name = "matches")
class Match() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @Column(name = "match_date", nullable = false)
    lateinit var matchDate: LocalDate

    @Column(name = "match_time")
    var matchTime: LocalTime? = null

    @Column(name = "home_team", nullable = false)
    lateinit var homeTeam: String

    @Column(name = "away_team", nullable = false)
    lateinit var awayTeam: String

    @Column(name = "home_score")
    var homeScore: Int? = null

    @Column(name = "away_score")
    var awayScore: Int? = null

    @Column(name = "stadium")
    var stadium: String? = null

    @Column(name = "competition", nullable = false)
    var competition: String = "K리그1"

    @Column(name = "season", nullable = false)
    lateinit var season: String

    @Column(name = "match_day")
    var matchDay: Int? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: MatchStatus = MatchStatus.SCHEDULED

    @Column(name = "created_at")
    var createdAt: Instant = Instant.now()

    @Column(name = "updated_at")
    var updatedAt: Instant = Instant.now()

    val isHomeGame: Boolean
        get() = homeTeam.contains("수원")

    val isSuwonMatch: Boolean
        get() = homeTeam.contains("수원") || awayTeam.contains("수원")
}
