package com.E205.cocos_forest.domain.ai.entity;

import com.E205.cocos_forest.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "daily_carbon_footprints")
@Getter
@NoArgsConstructor
public class DailyCarbonFootprint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "target_date", nullable = false) private LocalDate targetDate;
    @Column(name = "total_carbon_emissions", nullable = false) private Double totalCarbonEmissions;
    @Lob @Column(name = "ai_advice", nullable = false, columnDefinition = "TEXT") private String aiAdvice;
    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    @Builder
    public DailyCarbonFootprint(User user, LocalDate targetDate, Double totalCarbonEmissions, String aiAdvice) {
        this.user = user;
        this.targetDate = targetDate;
        this.totalCarbonEmissions = totalCarbonEmissions;
        this.aiAdvice = aiAdvice;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 기존 분석 결과의 내용을 갱신하는 메소드
     */
    public void updateAnalysis(Double newTotalEmissions, String newAiAdvice) {
        this.totalCarbonEmissions = newTotalEmissions;
        this.aiAdvice = newAiAdvice;
    }
}