package com.E205.cocos_forest.domain.forest.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 나무의 성장 단계를 나타내는 Enum
 */
@Getter
@RequiredArgsConstructor
public enum GrowthStage {
    
    SMALL("작은 나무", 60, 40),    // 최대체력 60, 성장조건 40 이상
    MEDIUM("중간 나무", 80, 65),   // 최대체력 80, 성장조건 65 이상  
    LARGE("큰 나무", 100, 80);     // 최대체력 100, 성장조건 80 이상
    
    private final String displayName;
    private final int maxHealth;
    private final int growthThreshold; // 성장을 위한 최소 체력
}