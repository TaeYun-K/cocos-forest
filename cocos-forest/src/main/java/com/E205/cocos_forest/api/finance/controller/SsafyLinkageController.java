package com.E205.cocos_forest.api.finance.controller;

import com.E205.cocos_forest.api.finance.dto.in.SsafyLinkageCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.SsafyLinkageOut;
import com.E205.cocos_forest.api.finance.service.SsafyLinkageService;
import com.E205.cocos_forest.global.external.ssafy.dto.SsafyRequest;
import com.E205.cocos_forest.global.response.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance/ssafy/linkages")
@RequiredArgsConstructor
@Validated
public class SsafyLinkageController {

    private final SsafyLinkageService ssafyLinkageService;

    /**
     * SSAFY 연동 생성/갱신 (userId 기준 upsert)
     * Body 래퍼를 쓰지 않고, 현재 DTO 그대로 바인딩 (네 BaseRequest를 쓰는 경우에는 시그니처만 바꿔줘)
     */

    @PostMapping("/register")
    public BaseResponse<SsafyLinkageOut> registerByEmail(
        @RequestBody @Valid SsafyLinkageCreateIn req
    ) {
        return new BaseResponse<>(ssafyLinkageService.registerByEmail(req));
    }



    /** 단건 조회 */
    @GetMapping("/{userId}")
    public ResponseEntity<BaseResponse<SsafyLinkageOut>> get(@PathVariable Long userId) {
        SsafyLinkageOut out = ssafyLinkageService.getByUserId(userId);
        return ResponseEntity.ok(new BaseResponse<>(out));
    }

    /** 삭제(선택) */
    @DeleteMapping("/{userId}")
    public ResponseEntity<BaseResponse<Object>> delete(@PathVariable Long userId) {
        ssafyLinkageService.deleteByUserId(userId);
        return ResponseEntity.ok(new BaseResponse<>()); // 바디 없는 성공 생성자 사용 :contentReference[oaicite:5]{index=5}
    }
}
