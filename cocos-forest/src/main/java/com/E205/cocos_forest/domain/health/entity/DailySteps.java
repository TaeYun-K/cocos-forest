package com.E205.cocos_forest.domain.health.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "daily_steps",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_daily_steps_user_date", columnNames = {"user_id", "target_date"})
    },
    indexes = {
        @Index(name = "idx_daily_steps_user", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class DailySteps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "user_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Long userId;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "steps", nullable = false)
    private Integer steps = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

