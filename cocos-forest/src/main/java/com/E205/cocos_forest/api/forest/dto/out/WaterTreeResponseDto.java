package com.E205.cocos_forest.api.forest.dto.out;

import com.E205.cocos_forest.domain.forest.entity.Plants;
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
    
    public static WaterTreeResponseDto success(Plants plants) {
        return WaterTreeResponseDto.builder()
                .success(true)
                .message("물주기 성공!")
                .currentHealth(plants.getHealth())
                .waterCountToday(plants.getWaterCountToday())
                .remainingWaterCount(3 - plants.getWaterCountToday())
                .build();
    }
    
    public static WaterTreeResponseDto failure(String message) {
        return WaterTreeResponseDto.builder()
                .success(false)
                .message(message)
                .build();
    }
}
