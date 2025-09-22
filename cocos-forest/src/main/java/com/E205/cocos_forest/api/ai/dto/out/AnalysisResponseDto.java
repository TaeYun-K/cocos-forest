package com.E205.cocos_forest.api.ai.dto.out;

import com.E205.cocos_forest.domain.ai.entity.DailyCarbonFootprint;
import java.time.LocalDate;
import lombok.Getter;

@Getter
public class AnalysisResponseDto {
    private final Long analysisId;
    private final LocalDate analyzedDate;
    private final Double totalCarbonEmissions; // g 단위
    private final String aiAdvice;

    public AnalysisResponseDto(DailyCarbonFootprint entity) {
        this.analysisId = entity.getId();
        this.analyzedDate = entity.getTargetDate();
        this.totalCarbonEmissions = entity.getTotalCarbonEmissions();
        this.aiAdvice = entity.getAiAdvice();
    }
}