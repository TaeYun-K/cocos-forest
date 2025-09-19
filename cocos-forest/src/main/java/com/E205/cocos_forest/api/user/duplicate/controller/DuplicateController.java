package com.E205.cocos_forest.api.user.duplicate.controller;

import com.E205.cocos_forest.api.user.duplicate.dto.in.NicknameCheckRequestDto; // DTO 임포트
import com.E205.cocos_forest.api.user.duplicate.service.NicknameCheckService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "User Signup", description = "사용자 관련 API")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class DuplicateController {

    private final NicknameCheckService nicknameCheckService;

    @Operation(summary = "닉네임 중복 확인", description = "회원가입 시 사용하는 닉네임이 이미 사용 중인지 확인합니다.") // ✨ 추가된 부분
    @PostMapping("/check-nickname-duplicate")
    public BaseResponse<Void> checkNicknameDuplicate(@Valid @RequestBody NicknameCheckRequestDto requestDto) { // ✨ 추가된 부분
        nicknameCheckService.checkNicknameDuplicate(requestDto.getNickname());
        return new BaseResponse<>();
    }
}