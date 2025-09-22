package com.E205.cocos_forest.api.user.myprofile.controller;

import com.E205.cocos_forest.api.user.myprofile.dto.MyProfileResponseDto;
import com.E205.cocos_forest.api.user.myprofile.service.MyProfileService;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class MyProfileController {

    private final MyProfileService myProfileService;

    @Operation(summary = "마이페이지 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
    @GetMapping("/myprofile")
    public BaseResponse<MyProfileResponseDto> getMyProfile(
                    @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUser().getId();

        MyProfileResponseDto profile = myProfileService.getMyProfile(userId);
        return new BaseResponse<>(profile);
    }
}
