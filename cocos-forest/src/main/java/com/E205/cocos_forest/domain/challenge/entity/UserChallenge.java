package com.E205.cocos_forest.domain.challenge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_challenges",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_challenges_user_chal_date", columnNames = {"user_id", "challenge_id", "challenge_date"})
    },
    indexes = {
        @Index(name = "idx_user_challenges_user", columnList = "user_id"),
        @Index(name = "idx_user_challenges_chal", columnList = "challenge_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class UserChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "user_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Long userId;

    @Column(name = "challenge_id", nullable = false, columnDefinition = "BIGINT UNSIGNED")
    private Long challengeId;

    @Column(name = "challenge_date", nullable = false)
    private LocalDate challengeDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status = Status.PENDING;

    @Column(name = "snapshot_json", columnDefinition = "json")
    private String snapshotJson;

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints = 0;

    @Column(name = "achieved_at")
    private LocalDateTime achievedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Status { PENDING, DONE, FAIL }

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

