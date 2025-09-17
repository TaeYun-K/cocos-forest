package com.E205.cocos_forest.domain.emission.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 일일 탄소 배출량 엔티티
 */
@Entity
@Table(name = "daily_emissions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@IdClass(DailyEmissionId.class)
public class DailyEmission {

    @Id
    @Column(name = "user_id", columnDefinition = "BIGINT UNSIGNED")
    private Long userId;

    @Id
    @Column(name = "emission_date")
    private LocalDate emissionDate;

    @Column(name = "total_emission", nullable = false, precision = 12, scale = 3)
    private BigDecimal totalEmission;

    @Column(name = "per_category", nullable = false, columnDefinition = "JSON")
    private String perCategory; // JSON 형태로 카테고리별 배출량 저장

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public DailyEmission(Long userId, LocalDate emissionDate, BigDecimal totalEmission, String perCategory) {
        this.userId = userId;
        this.emissionDate = emissionDate;
        this.totalEmission = totalEmission;
        this.perCategory = perCategory;
    }
}
