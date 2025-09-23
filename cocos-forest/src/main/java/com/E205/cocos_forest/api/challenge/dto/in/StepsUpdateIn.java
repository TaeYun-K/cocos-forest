package com.E205.cocos_forest.api.challenge.dto.in;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StepsUpdateIn {
    @Schema(description = "오늘의 총 걸음수", example = "7321")
    @Min(0)
    private Integer steps;
}

