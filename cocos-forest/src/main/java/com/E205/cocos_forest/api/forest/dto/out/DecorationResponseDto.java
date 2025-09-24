package com.E205.cocos_forest.api.forest.dto.out;

import com.E205.cocos_forest.domain.forest.entity.Decoration;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DecorationResponseDto {
    private Long id;
    private Long forestId;
    private Long assetId;
    private Integer x;
    private Integer y;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DecorationResponseDto from(Decoration d) {
        return DecorationResponseDto.builder()
                .id(d.getId())
                .forestId(d.getForestId())
                .assetId(d.getAssetId())
                .x(d.getX())
                .y(d.getY())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}

