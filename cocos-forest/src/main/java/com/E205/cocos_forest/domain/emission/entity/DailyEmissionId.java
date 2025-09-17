package com.E205.cocos_forest.domain.emission.entity;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DailyEmission의 복합 Primary Key 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class DailyEmissionId implements Serializable {
    
    private Long userId;
    private LocalDate emissionDate;
    
    public DailyEmissionId(Long userId, LocalDate emissionDate) {
        this.userId = userId;
        this.emissionDate = emissionDate;
    }
}
