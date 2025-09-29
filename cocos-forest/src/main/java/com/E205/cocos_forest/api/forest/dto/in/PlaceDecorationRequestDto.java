package com.E205.cocos_forest.api.forest.dto.in;

import lombok.Getter;

/**
 * 장식 배치 요청 DTO
 */
@Getter
public class PlaceDecorationRequestDto {

    private Long assetId;
    private Integer x;
    private Integer y;

    public PlaceDecorationRequestDto() {}

    public PlaceDecorationRequestDto(Long assetId, Integer x, Integer y) {
        this.assetId = assetId;
        this.x = x;
        this.y = y;
    }

    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public void setX(Integer x) { this.x = x; }
    public void setY(Integer y) { this.y = y; }
}

