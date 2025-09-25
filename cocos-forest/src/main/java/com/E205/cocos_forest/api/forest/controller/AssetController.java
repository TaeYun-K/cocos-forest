package com.E205.cocos_forest.api.forest.controller;

import com.E205.cocos_forest.api.forest.dto.in.MoveTreeRequestDto;
import com.E205.cocos_forest.api.forest.dto.in.PlaceDecorationRequestDto;
import com.E205.cocos_forest.api.forest.dto.in.PlantTreeRequestDto;
import com.E205.cocos_forest.api.forest.dto.out.AssetResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.DecorationResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.TreeResponseDto;
import com.E205.cocos_forest.api.forest.dto.out.WaterTreeResponseDto;
import com.E205.cocos_forest.api.forest.service.AssetService;
import com.E205.cocos_forest.api.forest.service.ForestService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forest/assets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Assets", description = "에셋 카탈로그 및 배치/행동 API")
public class AssetController {

    private final AssetService assetService;
    private final ForestService forestService;

    @GetMapping
    @Operation(summary = "에셋 목록 조회", description = "등록된 에셋 목록을 조회합니다. 카테고리 ID로 필터 가능")
    public ResponseEntity<BaseResponse<List<AssetResponseDto>>> listAssets(
            @Parameter(description = "카테고리 ID (선택)") @RequestParam(required = false) Long categoryId
    ) {
        List<AssetResponseDto> result = assetService.listAssets(categoryId);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    // 식물(나무/꽃) 심기: assetId=1,2만 허용 (서비스에서 검증)
    @PostMapping("/plants")
    @Operation(summary = "식물 심기", description = "식물(나무/꽃)을 심습니다. 에셋 가격만큼 포인트 차감")
    public ResponseEntity<BaseResponse<TreeResponseDto>> plant(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PlantTreeRequestDto request
    ) {
        Long userId = userDetails.getUser().getId();
        TreeResponseDto result = forestService.plant(userId, request);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    // 식물 물주기
    @PostMapping("/plants/{plantId}/water")
    @Operation(summary = "물주기", description = "식물(나무/꽃)에 물을 줍니다. (50포인트 차감, 하루 3회 제한)")
    public ResponseEntity<BaseResponse<WaterTreeResponseDto>> waterPlant(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "식물 ID") @PathVariable Long plantId
    ) {
        Long userId = userDetails.getUser().getId();
        WaterTreeResponseDto result = forestService.waterPlant(userId, plantId);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    // 식물 이동
    @PutMapping("/plants/move")
    @Operation(summary = "식물 이동", description = "식물(나무/꽃)의 위치를 변경합니다. (무료)")
    public ResponseEntity<BaseResponse<TreeResponseDto>> movePlant(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MoveTreeRequestDto request
    ) {
        Long userId = userDetails.getUser().getId();
        TreeResponseDto result = forestService.moveTree(userId, request);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    // 식물 삭제 (죽은 경우만 허용)
    @DeleteMapping("/plants/{plantId}")
    @Operation(summary = "식물 삭제", description = "죽은 식물만 삭제할 수 있습니다.")
    public ResponseEntity<BaseResponse<Void>> deletePlant(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "식물 ID") @PathVariable Long plantId
    ) {
        Long userId = userDetails.getUser().getId();
        forestService.removeDeadTree(userId, plantId);
        return ResponseEntity.ok(new BaseResponse<>());
    }

    // 장식 배치
    @PostMapping("/decorations")
    @Operation(summary = "장식 배치", description = "에셋을 장식으로 배치합니다. (식물 에셋 제외)")
    public ResponseEntity<BaseResponse<DecorationResponseDto>> placeDecoration(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PlaceDecorationRequestDto request
    ) {
        Long userId = userDetails.getUser().getId();
        DecorationResponseDto result = forestService.placeDecoration(userId, request);
        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    // 데코레이션 에셋 삿제
    @DeleteMapping("/decorations/{decorationId}")
    @Operation(summary = "장식 삭제", description = "장식 에셋을 삭제합니다. (식물 에셋 제외)")
    public ResponseEntity<BaseResponse<Void>> deleteDecoration(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "장식 id") @PathVariable Long decorationId
    ) {
        Long userId = userDetails.getUser().getId();
        forestService.removeDecoration(userId, decorationId);
        return ResponseEntity.ok(new BaseResponse<>());
    }
}
