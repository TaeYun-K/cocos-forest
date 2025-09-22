package com.E205.cocos_forest.api.user.myprofile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Schema(description = "마이페이지 응답 DTO")
public class MyProfileResponseDto {

    @Schema(description = "사용자 닉네임", example = "코코친구")
    private String nickname;

    @Schema(description = "현재 보유 포인트", example = "1250")
    private Long currentBalance;

    @Schema(description = "연결된 계좌 목록")
    private List<ConnectedAccountDto> connectedAccounts;

    @Getter
    @Builder
    @Schema(description = "연결된 계좌 정보")
    public static class ConnectedAccountDto {

        @Schema(description = "계좌번호", example = "0016362784354239")
        private String accountNo;

        @Schema(description = "은행코드", example = "001")
        private String bankCode;

        @Schema(description = "은행명", example = "001")
        private String bankName;
    }
}
