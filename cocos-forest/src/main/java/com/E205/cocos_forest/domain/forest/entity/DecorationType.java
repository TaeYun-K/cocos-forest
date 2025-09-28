package com.E205.cocos_forest.domain.forest.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 기존 DB 테이블(forest_decorations)의 decoration_type ENUM과 1:1 매핑
 */
@Getter
@RequiredArgsConstructor
public enum DecorationType {
    BENCH,
    FLOWER_BED,
    ROCK,
    FOUNTAIN;
}

