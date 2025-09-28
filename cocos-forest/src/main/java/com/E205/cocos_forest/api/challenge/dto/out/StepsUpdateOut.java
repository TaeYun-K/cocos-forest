package com.E205.cocos_forest.api.challenge.dto.out;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StepsUpdateOut {
    @Schema(description = "YYYY-MM-DD")
    private String date;

    @Schema(description = "오늘의 총 걸음수")
    private Integer steps;
}

