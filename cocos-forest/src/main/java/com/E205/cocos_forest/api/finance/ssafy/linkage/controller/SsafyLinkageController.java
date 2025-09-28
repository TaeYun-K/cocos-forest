package com.E205.cocos_forest.api.finance.ssafy.linkage.controller;

import com.E205.cocos_forest.api.finance.ssafy.linkage.dto.out.SsafyLinkageOut;
import com.E205.cocos_forest.api.finance.ssafy.linkage.service.SsafyLinkageService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
        @AuthenticationPrincipal CustomUserDetails principal
    ) {
        Long userId = principal.getUser().getId();
        String email = principal.getUser().getEmail();
        return new BaseResponse<>(ssafyLinkageService.registerByEmail(userId, email));
    }



    @Operation(summary = "SSAFY 사용자 검색", description = "이메일을 받아 SSAFY 사용자 존재 여부를 확인합니다.")
    @PostMapping("/search")
    public BaseResponse<Boolean> searchUser(@AuthenticationPrincipal CustomUserDetails principal) {
        String email = principal.getUser().getEmail();
        boolean exists = ssafyLinkageService.searchUserByEmail(email);
        return new BaseResponse<>(exists);
    }
}
