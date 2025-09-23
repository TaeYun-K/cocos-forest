package com.E205.cocos_forest.api.forest.controller;

import com.E205.cocos_forest.domain.forest.dto.*;
import com.E205.cocos_forest.api.forest.service.ForestService;
import com.E205.cocos_forest.api.forest.service.PointService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forest")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Forest", description = "숲 게임 관리 API")
public class ForestController {

    private final ForestService forestService;
    private final PointService pointService;

    /**
     * 내 숲 조회 (없으면 생성)
     */
    @GetMapping
    @Operation(summary = "내 숲 조회", description = "사용자의 숲 정보를 조회합니다. 없으면 자동 생성합니다.")
    public ResponseEntity<BaseResponse<ForestResponseDto>> getMyForest(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();

        try {
            ForestResponseDto forest = forestService.getForest(userId);
            return ResponseEntity.ok(new BaseResponse<>(forest));
        } catch (BaseException e) {
            // 존재하지 않는 경우에만 자동 생성
            if (e.getStatus() == BaseResponseStatus.FOREST_NOT_FOUND) {
                ForestResponseDto newForest = forestService.createForest(userId);
                return ResponseEntity.ok(new BaseResponse<>(newForest));
            }
            throw e;
        }
    }

    /**
     * 현재 포인트 조회
     */
    @GetMapping("/points")
    @Operation(summary = "현재 포인트 조회", description = "사용자의 현재 포인트 잔액을 조회합니다.")
    public ResponseEntity<BaseResponse<Long>> getCurrentPoints(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();
        Long points = pointService.getCurrentPoints(userId);

        return ResponseEntity.ok(new BaseResponse<>(points));
    }

    /**
     * 나무 심기
     */
    @PostMapping("/trees")
    @Operation(summary = "나무 심기", description = "지정된 위치에 나무를 심습니다. (100포인트 차감)")
    public ResponseEntity<BaseResponse<TreeResponseDto>> plantTree(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PlantTreeRequestDto request) {

        Long userId = userDetails.getUser().getId();
        TreeResponseDto tree = forestService.plantTree(userId, request);

        return ResponseEntity.ok(new BaseResponse<>(tree));
    }

    /**
     * 물주기
     */
    @PostMapping("/trees/{treeId}/water")
    @Operation(summary = "물주기", description = "나무에 물을 줍니다. (50포인트 차감, 하루 3회 한도)")
    public ResponseEntity<BaseResponse<WaterTreeResponseDto>> waterTree(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "나무 ID") @PathVariable Long treeId) {

        Long userId = userDetails.getUser().getId();
        WaterTreeResponseDto result = forestService.waterTree(userId, treeId);

        return ResponseEntity.ok(new BaseResponse<>(result));
    }

    /**
     * 나무 위치 이동
     */
    @PutMapping("/trees/move")
    @Operation(summary = "나무 위치 이동", description = "나무를 다른 위치로 이동합니다. (무료)")
    public ResponseEntity<BaseResponse<TreeResponseDto>> moveTree(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MoveTreeRequestDto request) {

        Long userId = userDetails.getUser().getId();
        TreeResponseDto tree = forestService.moveTree(userId, request);

        return ResponseEntity.ok(new BaseResponse<>(tree));
    }

    /**
     * 죽은 나무 제거 (영구 삭제)
     */
    @DeleteMapping("/trees/{treeId}/dead")
    @Operation(summary = "죽은 나무 제거", description = "죽은 나무를 영구 삭제하여 숲을 정리합니다.")
    public ResponseEntity<BaseResponse<Void>> removeDeadTree(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "나무 ID") @PathVariable Long treeId) {

        Long userId = userDetails.getUser().getId();
        forestService.removeDeadTree(userId, treeId);

        return ResponseEntity.ok(new BaseResponse<>());
    }

    /**
     * 숲 확장
     */
    @PostMapping("/expand")
    @Operation(summary = "숲 확장", description = "숲의 크기를 2x2 확장합니다. (1000포인트 차감)")
    public ResponseEntity<BaseResponse<ForestResponseDto>> expandForest(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();
        ForestResponseDto forest = forestService.expandForest(userId);

        return ResponseEntity.ok(new BaseResponse<>(forest));
    }

    /**
     * 연못 위치 이동
     */
    @PutMapping("/pond/move")
    @Operation(summary = "연못 위치 이동", description = "연못을 다른 위치로 이동합니다. (무료)")
    public ResponseEntity<BaseResponse<ForestResponseDto>> movePond(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody MovePondRequestDto request) {

        Long userId = userDetails.getUser().getId();
        ForestResponseDto forest = forestService.movePond(userId, request);

        return ResponseEntity.ok(new BaseResponse<>(forest));
    }
}

