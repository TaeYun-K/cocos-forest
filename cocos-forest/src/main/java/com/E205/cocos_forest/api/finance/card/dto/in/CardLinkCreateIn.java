package com.E205.cocos_forest.api.finance.card.dto.in;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CardLinkCreateIn {
    @NotNull
    private Long productId; // 선택한 카드 상품 ID

    @NotBlank
    private String withdrawalAccountNo; // 출금 계좌번호

    @NotBlank
    private String withdrawalDate; // 출금일(문자 "4" 등)
}
