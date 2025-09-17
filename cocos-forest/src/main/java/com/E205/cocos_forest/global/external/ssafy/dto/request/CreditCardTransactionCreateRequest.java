package com.E205.cocos_forest.global.external.ssafy.dto.request;

import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeader;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreditCardTransactionCreateRequest {
    @JsonProperty("Header")
    private final SsafyHeader header;

    @JsonProperty("cardNo")
    private final String cardNo;

    @JsonProperty("cvc")
    private final String cvc;

    @JsonProperty("merchantId")
    private final String merchantId;

    @JsonProperty("paymentBalance")
    private final String paymentBalance;
}

