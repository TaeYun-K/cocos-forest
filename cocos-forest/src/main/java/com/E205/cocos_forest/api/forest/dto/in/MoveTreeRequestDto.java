package com.E205.cocos_forest.api.forest.dto.in;

import lombok.Getter;

/**
 * 나무 위치 이동 요청 DTO
 */
@Getter
public class MoveTreeRequestDto {
    
    private Long treeId;
    private Integer newX;
    private Integer newY;
    
    // 기본 생성자와 setter가 필요 (JSON 파싱용)
    public MoveTreeRequestDto() {}
    
    public MoveTreeRequestDto(Long treeId, Integer newX, Integer newY) {
        this.treeId = treeId;
        this.newX = newX;
        this.newY = newY;
    }
    
    public void setTreeId(Long treeId) { this.treeId = treeId; }
    public void setNewX(Integer newX) { this.newX = newX; }
    public void setNewY(Integer newY) { this.newY = newY; }
}
