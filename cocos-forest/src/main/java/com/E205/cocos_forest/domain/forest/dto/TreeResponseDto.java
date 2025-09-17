package com.E205.cocos_forest.domain.forest.dto;

import com.E205.cocos_forest.domain.forest.entity.GrowthStage;
import com.E205.cocos_forest.domain.forest.entity.Tree;
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
    private GrowthStage growthStage;
    private Integer health;
    private Integer maxHealth;
    private Integer growthDays;
    private Boolean isDead;
    private Boolean deadHighlight;
    private LocalDate lastWateredDate;
    private Integer waterCountToday;
    private LocalDateTime plantedAt;
    
    public static TreeResponseDto from(Tree tree) {
        return TreeResponseDto.builder()
                .treeId(tree.getId())
                .x(tree.getX())
                .y(tree.getY())
                .growthStage(tree.getGrowthStage())
                .health(tree.getHealth())
                .maxHealth(tree.getMaxHealth())
                .growthDays(tree.getGrowthDays())
                .isDead(tree.getIsDead())
                .deadHighlight(tree.getDeadHighlight())
                .lastWateredDate(tree.getLastWateredDate())
                .waterCountToday(tree.getWaterCountToday())
                .plantedAt(tree.getPlantedAt())
                .build();
    }
}
