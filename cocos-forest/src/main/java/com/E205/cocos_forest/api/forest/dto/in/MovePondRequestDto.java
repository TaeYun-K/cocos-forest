package com.E205.cocos_forest.api.forest.dto.in;

import lombok.Getter;

/**
 * 연못 위치 이동 요청 DTO
 */
@Getter
public class MovePondRequestDto {
    
    private Integer newX;
    private Integer newY;
    
    // 기본 생성자와 setter가 필요 (JSON 파싱용)
    public MovePondRequestDto() {}
    
    public MovePondRequestDto(Integer newX, Integer newY) {
        this.newX = newX;
        this.newY = newY;
    }
    
    public void setNewX(Integer newX) { this.newX = newX; }
    public void setNewY(Integer newY) { this.newY = newY; }
}
