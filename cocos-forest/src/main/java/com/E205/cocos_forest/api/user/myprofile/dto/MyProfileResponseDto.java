package com.E205.cocos_forest.api.user.myprofile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "마이페이지 응답 DTO")
public class MyProfileResponseDto {

    @Schema(description = "사용자 닉네임", example = "코코친구")
    private String nickname;

    @Schema(description = "현재 보유 포인트", example = "1250")
    private Long currentBalance;
}
