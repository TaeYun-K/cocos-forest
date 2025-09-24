package com.E205.cocos_forest.domain.forest.entity;

import jakarta.persistence.*;
import com.E205.cocos_forest.domain.forest.entity.Asset;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 숲에 심어진 나무 정보를 담는 엔티티
 */
@Entity
@Table(name = "user_plants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Plants {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(name = "forest_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long forestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forest_id", insertable = false, updatable = false)
    private Forest forest;

    @Column(nullable = false)
    private Integer x; // x좌표

    @Column(nullable = false)
    private Integer y; // y좌표

    /** 심은 자산 FK (assets.id) */
    @Column(name = "asset_id", columnDefinition = "BIGINT UNSIGNED", nullable = false)
    private Long assetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", insertable = false, updatable = false)
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(name = "growth_stage", nullable = false)
    private GrowthStage growthStage = GrowthStage.SMALL;

    @Column(nullable = false)
    private Integer health; // 현재 체력

    @Column(name = "max_health", nullable = false)
    private Integer maxHealth; // 최대 체력

    @Column(name = "growth_days", nullable = false)
    private Integer growthDays = 0; // 현재 단계에서 성장한 일수

    @Column(name = "is_dead", nullable = false)
    private Boolean isDead = false; // 나무가 죽었는지 여부

    @Column(name = "dead_highlight", nullable = false)
    private Boolean deadHighlight = false; // 죽음 하이라이트 표시 여부

    @Column(name = "last_watered_date")
    private LocalDate lastWateredDate; // 마지막 물준 날짜

    @Column(name = "water_count_today", nullable = false)
    private Integer waterCountToday = 0; // 오늘 물준 횟수

    @CreationTimestamp
    @Column(name = "planted_at", updatable = false)
    private LocalDateTime plantedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Plants(Long forestId, Integer x, Integer y, GrowthStage growthStage, Long assetId) {
        this.forestId = forestId;
        this.x = x;
        this.y = y;
        this.growthStage = growthStage != null ? growthStage : GrowthStage.SMALL;
        this.health = this.growthStage.getMaxHealth();
        this.maxHealth = this.growthStage.getMaxHealth();
        this.assetId = assetId;
    }

    /**
     * 물주기 (하루 3회 제한)
     */
    public boolean water() {
        if (isDead) {
            return false; // 죽은 나무에는 물을 줄 수 없음
        }

        LocalDate today = LocalDate.now();
        
        // 날짜가 바뀌었으면 물주기 카운트 리셋
        if (!today.equals(lastWateredDate)) {
            this.waterCountToday = 0;
        }

        // 하루 3회 제한 체크
        if (waterCountToday >= 3) {
            return false;
        }

        // 물주기 실행
        this.health = Math.min(health + 5, maxHealth);
        this.waterCountToday++;
        this.lastWateredDate = today;
        
        return true;
    }

    /**
     * 체력 감소
     */
    public void decreaseHealth(int amount) {
        this.health = Math.max(0, health - amount);
        
        // 체력이 0이 되면 사망 처리
        if (this.health == 0 && !isDead) {
            this.isDead = true;
            this.deadHighlight = true;
        }
    }

    /**
     * 성장 처리 (매일 배치 작업에서 호출)
     */
    public void processGrowth() {
        if (isDead) return;

        boolean canGrow = false;
        
        // 성장 조건 체크
        switch (growthStage) {
            case SMALL:
                canGrow = health >= 40; // 60의 2/3
                break;
            case MEDIUM:
                canGrow = health >= 65; // 80의 약 80%
                break;
            case LARGE:
                canGrow = health >= 80; // 100의 80%
                break;
        }

        if (canGrow) {
            this.growthDays++;
            
            // 3일 달성 시 성장 단계 업그레이드
            if (growthDays >= 3) {
                upgradeGrowthStage();
            }
        } else {
            // 성장 조건 미달 시 진행도 리셋
            this.growthDays = 0;
        }
    }

    /**
     * 성장 단계 업그레이드
     */
    private void upgradeGrowthStage() {
        switch (growthStage) {
            case SMALL:
                this.growthStage = GrowthStage.MEDIUM;
                this.maxHealth = 80;
                break;
            case MEDIUM:
                this.growthStage = GrowthStage.LARGE;
                this.maxHealth = 100;
                break;
            case LARGE:
                // 이미 최대 성장
                break;
        }
        this.growthDays = 0;
    }

    /**
     * 위치 이동
     */
    public void moveTo(int newX, int newY) {
        this.x = newX;
        this.y = newY;
    }

    /**
     * 사망 하이라이트 제거 (사용자가 터치했을 때)
     */
    public void removeDead() {
        if (isDead && deadHighlight) {
            this.deadHighlight = false;
        }
    }

    /**
     * 물주기 카운트 리셋 (배치 작업용)
     */
    public void resetWaterCount() {
        this.waterCountToday = 0;
    }

    /**
     * 완전 성장 나무인지 확인 (포인트 지급 대상)
     */
    public boolean isFullyGrown() {
        return growthStage == GrowthStage.LARGE && health >= 80 && !isDead;
    }

    public void updatePosition(int newX, int newY) {
        this.x = newX;
        this.y = newY;
    }
}