package com.E205.cocos_forest.global.external.ssafy.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class CreditCardTransactionCreateResponse {
    @JsonProperty("Header")
    private AccountCreateResponse.AccountCreateHeader header;

    @JsonProperty("REC")
    private Rec rec;

    @Getter
    public static class Rec {
        @JsonProperty("transactionUniqueNo")
        private String transactionUniqueNo;
        @JsonProperty("categoryId")
        private String categoryId;
        @JsonProperty("categoryName")
        private String categoryName;
        @JsonProperty("merchantId")
        private String merchantId;
        @JsonProperty("merchantName")
        private String merchantName;
        @JsonProperty("transactionDate")
        private String transactionDate;
        @JsonProperty("transactionTime")
        private String transactionTime;
        @JsonProperty("paymentBalance")
        private String paymentBalance;
    }
}

