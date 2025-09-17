package com.E205.cocos_forest.domain.forest.dto;

import com.E205.cocos_forest.domain.forest.entity.Tree;
import lombok.Builder;
import lombok.Getter;

/**
 * 물주기 응답 DTO
 */
@Getter
@Builder
public class WaterTreeResponseDto {
    
    private Boolean success;
    private String message;
    private Integer currentHealth;
    private Integer waterCountToday;
    private Integer remainingWaterCount;
    
    public static WaterTreeResponseDto success(Tree tree) {
        return WaterTreeResponseDto.builder()
                .success(true)
                .message("물주기 성공!")
                .currentHealth(tree.getHealth())
                .waterCountToday(tree.getWaterCountToday())
                .remainingWaterCount(3 - tree.getWaterCountToday())
                .build();
    }
    
    public static WaterTreeResponseDto failure(String message) {
        return WaterTreeResponseDto.builder()
                .success(false)
                .message(message)
                .build();
    }
}
