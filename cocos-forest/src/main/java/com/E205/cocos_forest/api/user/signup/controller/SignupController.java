package com.E205.cocos_forest.api.user.signup.controller;

import com.E205.cocos_forest.api.user.signup.dto.in.SignupRequestDto;
import com.E205.cocos_forest.api.user.signup.dto.out.SignupResponseDto;
import com.E205.cocos_forest.api.user.signup.service.SignupService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Tag: 컨트롤러 그룹의 이름과 설명을 정의합니다. (예: "User Signup")
 *
 * @RestController: 이 클래스가 REST API를 처리하는 컨트롤러임을 나타내며, 메서드의 반환값은 자동으로 JSON 형태로 변환됩니다.
 *
 * @RequestMapping("/api/user"): 이 컨트롤러의 모든 API는 /api/user 라는 공통 경로를 가집니다.
 *
 * @Operation: 각 API 엔드포인트의 기능(summary)과 상세 설명(description)을 정의합니다.
 */
@Tag(name = "User Signup", description = "사용자 회원가입 관련 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    @Operation(summary = "회원가입", description = "사용자 정보를 받아 회원가입을 처리합니다.")
    @PostMapping("/signup")
    public BaseResponse<SignupResponseDto> signup(@Valid @RequestBody SignupRequestDto requestDto) {
        SignupResponseDto responseDto = signupService.signup(requestDto);
        return new BaseResponse<>(responseDto);
    }
}