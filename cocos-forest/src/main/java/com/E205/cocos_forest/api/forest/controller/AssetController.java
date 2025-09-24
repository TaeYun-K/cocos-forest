package com.E205.cocos_forest.api.forest.controller;

import com.E205.cocos_forest.api.forest.service.AssetService;
import com.E205.cocos_forest.domain.forest.dto.AssetResponseDto;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/forest/assets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Assets", description = "장식 에셋 카탈로그 API")
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @Operation(summary = "에셋 목록 조회", description = "활성화된 에셋 목록을 조회합니다. 카테고리 ID로 필터링 가능.")
    public ResponseEntity<BaseResponse<List<AssetResponseDto>>> listAssets(
            @Parameter(description = "카테고리 ID (선택)") @RequestParam(required = false) Long categoryId
    ) {
        List<AssetResponseDto> result = assetService.listAssets(categoryId);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }
}

