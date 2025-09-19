package com.E205.cocos_forest.api.email.controller;

import com.E205.cocos_forest.api.email.dto.in.EmailSendRequestDto;
import com.E205.cocos_forest.api.email.dto.in.EmailVerifyRequestDto;
import com.E205.cocos_forest.api.email.service.EmailService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Email Verification", description = "이메일 인증 관련 API")
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @Operation(summary = "이메일 중복 확인", description = "회원가입 시 사용하는 이메일이 이미 사용 중인지 확인합니다.")
    @PostMapping("/check-email-duplicate")
    public BaseResponse<Void> checkEmailDuplicate(@Valid @RequestBody EmailSendRequestDto requestDto) {
        emailService.checkEmailDuplicate(requestDto.getEmail());
        // 중복이 아니면 성공 응답 (결과 데이터 없음)
        return new BaseResponse<>();
    }
    @Operation(summary = "인증 코드 이메일 발송", description = "지정된 이메일로 6자리 인증 코드를 발송합니다.")
    @PostMapping("/send-verification")
    public BaseResponse<Void> sendVerificationEmail(@Valid @RequestBody EmailSendRequestDto requestDto) {
        emailService.sendVerificationEmail(requestDto);
        return new BaseResponse<>(); // 성공 시 결과 데이터 없이 BaseResponse 반환
    }

    @Operation(summary = "이메일 인증 코드 검증", description = "이메일과 인증 코드를 받아 유효성을 검증합니다.")
    @PostMapping("/verify-code")
    public BaseResponse<Void> verifyEmailCode(@Valid @RequestBody EmailVerifyRequestDto requestDto) {
        emailService.verifyEmailCode(requestDto);
        return new BaseResponse<>();
    }
}