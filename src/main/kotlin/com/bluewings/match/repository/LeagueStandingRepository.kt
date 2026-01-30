package com.bluewings.match.repository

import com.bluewings.match.domain.LeagueStanding
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class LeagueStandingRepository : PanacheRepository<LeagueStanding> {

    fun findBySeasonOrderByPosition(season: String): List<LeagueStanding> =
        list("season = ?1 ORDER BY position ASC", season)

    fun findBySeasonAndTeam(season: String, teamName: String): LeagueStanding? =
        find("season = ?1 AND teamName = ?2", season, teamName).firstResult()

    fun findCurrentSeason(): List<LeagueStanding> {
        val currentYear = java.time.Year.now().value.toString()
        return findBySeasonOrderByPosition(currentYear)
    }
}
