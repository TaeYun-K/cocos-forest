package com.E205.cocos_forest.domain.forest.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Decorations(장식) 분류
 */
@Getter
@RequiredArgsConstructor
public enum DecorationCategory {
    PROP("소품"),
    GROUND_OVERLAY("바닥 덮개"),
    FENCE("울타리"),
    EFFECT("이펙트");

    private final String displayName;
}

