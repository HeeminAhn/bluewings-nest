package com.bluewings.community.domain

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "categories")
class Category() {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

    @Column(nullable = false, unique = true, length = 50)
    var name: String = ""

    @Column(length = 200)
    var description: String? = null

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true

    @Column(length = 20)
    var color: String = "gray"

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    constructor(name: String, description: String?, displayOrder: Int, color: String = "gray") : this() {
        this.name = name
        this.description = description
        this.displayOrder = displayOrder
        this.color = color
    }

    fun update(name: String, description: String?, displayOrder: Int, isActive: Boolean, color: String) {
        this.name = name
        this.description = description
        this.displayOrder = displayOrder
        this.isActive = isActive
        this.color = color
        this.updatedAt = LocalDateTime.now()
    }
}
