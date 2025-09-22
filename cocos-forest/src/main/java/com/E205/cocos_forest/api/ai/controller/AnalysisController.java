package com.E205.cocos_forest.api.ai.controller;

import com.E205.cocos_forest.api.ai.dto.in.AnalysisRequestDto;
import com.E205.cocos_forest.api.ai.dto.out.AnalysisResponseDto;
import com.E205.cocos_forest.api.ai.service.AnalysisService;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/carbon")
@RequiredArgsConstructor
@Tag(name = "AI Analysis", description = "AI 분석 통합 API")
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/analyze")
    @Operation(summary = "일별 상세 거래 내역 리포트 기반 AI 분석",
               description = "외부 API의 상세 거래 내역 리포트 전체를 받아 저장하고 AI 분석을 수행합니다.")
    public BaseResponse<AnalysisResponseDto> analyzeReport(
        @AuthenticationPrincipal(expression = "userId") Long userId,
        @RequestBody AnalysisRequestDto reportDto
    ) {
        try {
            AnalysisResponseDto response = analysisService.analyzeReport(userId, reportDto);
            return new BaseResponse<>(response);
        } catch (IOException e) {
            return new BaseResponse<>(BaseResponseStatus.EXTERNAL_API_ERROR);
        }
    }
}