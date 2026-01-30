package com.bluewings.match.domain

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "league_standings")
class LeagueStanding() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @Column(name = "season", nullable = false)
    lateinit var season: String

    @Column(name = "team_name", nullable = false)
    lateinit var teamName: String

    @Column(name = "position", nullable = false)
    var position: Int = 0

    @Column(name = "played", nullable = false)
    var played: Int = 0

    @Column(name = "won", nullable = false)
    var won: Int = 0

    @Column(name = "drawn", nullable = false)
    var drawn: Int = 0

    @Column(name = "lost", nullable = false)
    var lost: Int = 0

    @Column(name = "goals_for", nullable = false)
    var goalsFor: Int = 0

    @Column(name = "goals_against", nullable = false)
    var goalsAgainst: Int = 0

    @Column(name = "goal_difference", nullable = false)
    var goalDifference: Int = 0

    @Column(name = "points", nullable = false)
    var points: Int = 0

    @Column(name = "updated_at")
    var updatedAt: Instant = Instant.now()

    val isSuwon: Boolean
        get() = teamName.contains("수원")
}
