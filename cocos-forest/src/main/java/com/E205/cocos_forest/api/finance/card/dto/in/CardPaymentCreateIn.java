package com.E205.cocos_forest.api.finance.card.dto.in;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardPaymentCreateIn {
    @NotNull
    private Long merchantId; // SSAFY merchant id

    @NotNull
    @Min(1)
    private Long paymentBalance; // KRW amount
}
