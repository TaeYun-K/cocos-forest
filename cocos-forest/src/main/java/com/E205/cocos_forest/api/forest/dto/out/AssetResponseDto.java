package com.E205.cocos_forest.api.forest.dto.out;

import com.E205.cocos_forest.domain.forest.entity.Asset;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AssetResponseDto {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryCode;
    private String categoryName;
    private Integer pricePoints;
    private String spriteKey;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssetResponseDto from(Asset a) {
        return AssetResponseDto.builder()
                .id(a.getId())
                .name(a.getName())
                .categoryId(a.getCategoryId())
                .categoryCode(a.getCategory() != null ? a.getCategory().getCode() : null)
                .categoryName(a.getCategory() != null ? a.getCategory().getName() : null)
                .pricePoints(a.getPricePoints())
                .spriteKey(a.getSpriteKey())
                .active(a.getActive())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}

