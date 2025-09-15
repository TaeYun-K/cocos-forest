package com.E205.cocos_forest.api.finance.controller;

import com.E205.cocos_forest.api.finance.dto.in.SsafyLinkageCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.SsafyLinkageOut;
import com.E205.cocos_forest.api.finance.service.SsafyLinkageService;
import com.E205.cocos_forest.global.external.ssafy.dto.SsafyRequest;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SSAFY 연동 API", description = "SSAFY 연동 생성, 검색, 삭제 관련 API")
@RestController
@RequestMapping("/api/finance/ssafy/linkages")
@RequiredArgsConstructor
@Validated
public class SsafyLinkageController {

    private final SsafyLinkageService ssafyLinkageService;


    @Operation(summary = "SSAFY 연동 생성", description = "이메일을 받아 SSAFY 연동을 생성합니다.")
    @PostMapping("/register")
    public BaseResponse<SsafyLinkageOut> registerByEmail(
        @RequestBody @Valid SsafyLinkageCreateIn req
    ) {
        return new BaseResponse<>(ssafyLinkageService.registerByEmail(req));
    }



    @Operation(summary = "SSAFY 사용자 검색", description = "이메일을 받아 SSAFY 사용자 존재 여부를 확인합니다.")
    @PostMapping("/search")
    public BaseResponse<Boolean> searchUser(@RequestBody @Valid SsafyLinkageCreateIn req) {
        boolean exists = ssafyLinkageService.searchUserByEmail(req);
        return new BaseResponse<>(exists);
    }

    @Operation(summary = "SSAFY 연동 삭제", description = "사용자 ID를 받아 SSAFY 연동을 삭제합니다.")
    @DeleteMapping("/{userId}")
    public ResponseEntity<BaseResponse<Object>> delete(@PathVariable Long userId) {
        ssafyLinkageService.deleteByUserId(userId);
        return ResponseEntity.ok(new BaseResponse<>()); // 바디 없는 성공 생성자 사용 :contentReference[oaicite:5]{index=5}
    }
}
