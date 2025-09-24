package com.E205.cocos_forest.api.forest.dto.in;

import lombok.Getter;

/**
 * 나무 심기 요청 DTO
 */
@Getter
public class PlantTreeRequestDto {
    
    private Integer x;
    private Integer y;
    private Long assetId;
    
    // 기본 생성자와 setter가 필요 (JSON 파싱용)
    public PlantTreeRequestDto() {}
    
    public PlantTreeRequestDto(Integer x, Integer y) {
        this.x = x;
        this.y = y;
    }
    
    public void setX(Integer x) { this.x = x; }
    public void setY(Integer y) { this.y = y; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
}
