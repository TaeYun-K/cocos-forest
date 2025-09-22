package com.E205.cocos_forest.api.user.login.controller;

import com.E205.cocos_forest.api.user.login.dto.in.LoginRequestDto;
import com.E205.cocos_forest.api.user.login.dto.in.LogoutRequestDto;
import com.E205.cocos_forest.api.user.login.dto.in.ReissueRequestDto;
import com.E205.cocos_forest.api.user.login.service.AuthService;
import com.E205.cocos_forest.global.jwt.TokenInfo;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User", description = "사용자 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class AuthController {

    private final AuthService authService;


    @PostMapping("/login")
    public BaseResponse<TokenInfo> login(@RequestBody LoginRequestDto loginRequestDto) {
        TokenInfo tokenInfo = authService.login(loginRequestDto.getEmail(), loginRequestDto.getPassword());
        return new BaseResponse<>(tokenInfo);
    }

    @PostMapping("/reissue")
    public BaseResponse<TokenInfo> reissue(@RequestBody ReissueRequestDto reissueRequestDto) {
        TokenInfo tokenInfo = authService.reissue(reissueRequestDto.getRefreshToken());
        return new BaseResponse<>(tokenInfo);
    }

    @PostMapping("/logout")
    public BaseResponse<Void> logout(@RequestBody LogoutRequestDto logoutRequestDto) {
        authService.logout(logoutRequestDto.getRefreshToken());
        return new BaseResponse<>(); // 성공 시 빈 응답 반환
    }
}