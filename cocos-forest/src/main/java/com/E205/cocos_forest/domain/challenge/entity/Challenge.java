package com.E205.cocos_forest.domain.challenge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenges")
@Getter
@NoArgsConstructor
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "category_id", length = 32)
    private String categoryId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Difficulty difficulty = Difficulty.NORMAL;

    @Column(name = "reward_points", nullable = false)
    private Integer rewardPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", length = 16)
    private MetricType metricType;

    @Enumerated(EnumType.STRING)
    @Column(name = "comparator", length = 8)
    private ComparatorType comparator;

    @Column(name = "threshold_value", precision = 12, scale = 3, nullable = false)
    private BigDecimal thresholdValue = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "period", nullable = false, length = 16)
    private PeriodType period = PeriodType.DAILY;

    @Column(name = "extra_conditions", columnDefinition = "json")
    private String extraConditions;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    public enum Difficulty { EASY, NORMAL, HARD }

    public enum MetricType { AMOUNT, EMISSION, ATTENDANCE, STEPS }

    public enum ComparatorType { LTE, GTE }

    public enum PeriodType { DAILY }
}

