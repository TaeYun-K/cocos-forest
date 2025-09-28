package com.E205.cocos_forest.api.forest.dto.out;

import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Plants;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 나무 정보 응답 DTO
 */
@Getter
@Builder
public class TreeResponseDto {
    
    private Long treeId;
    private Integer x;
    private Integer y;
    private Long assetId;
    private String spriteKey;
    private GrowthStage growthStage;
    private Integer health;
    private Integer maxHealth;
    private Integer growthDays;
    private Boolean isDead;
    private Boolean deadHighlight;
    private LocalDate lastWateredDate;
    private Integer waterCountToday;
    private LocalDateTime plantedAt;
    
    public static TreeResponseDto from(Plants plants) {
        return TreeResponseDto.builder()
                .treeId(plants.getId())
                .x(plants.getX())
                .y(plants.getY())
                .assetId(plants.getAssetId())
                .spriteKey(plants.getAsset() != null ? plants.getAsset().getSpriteKey() : null)
                .growthStage(plants.getGrowthStage())
                .health(plants.getHealth())
                .maxHealth(plants.getMaxHealth())
                .growthDays(plants.getGrowthDays())
                .isDead(plants.getIsDead())
                .deadHighlight(plants.getDeadHighlight())
                .lastWateredDate(plants.getLastWateredDate())
                .waterCountToday(plants.getWaterCountToday())
                .plantedAt(plants.getPlantedAt())
                .build();
    }
}
