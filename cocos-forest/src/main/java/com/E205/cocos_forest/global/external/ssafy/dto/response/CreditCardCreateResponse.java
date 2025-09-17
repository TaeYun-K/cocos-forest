package com.E205.cocos_forest.global.external.ssafy.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class CreditCardCreateResponse {
    @JsonProperty("Header")
    private AccountCreateResponse.AccountCreateHeader header;

    @JsonProperty("REC")
    private CreditCardCreateRec rec;

    @Getter
    public static class CreditCardCreateRec {
        @JsonProperty("cardNo")
        private String cardNo;
        @JsonProperty("cvc")
        private String cvc;
        @JsonProperty("cardUniqueNo")
        private String cardUniqueNo;
        @JsonProperty("cardIssuerCode")
        private String cardIssuerCode;
        @JsonProperty("cardIssuerName")
        private String cardIssuerName;
        @JsonProperty("cardName")
        private String cardName;
        @JsonProperty("baselinePerformance")
        private String baselinePerformance;
        @JsonProperty("maxBenefitLimit")
        private String maxBenefitLimit;
        @JsonProperty("cardDescription")
        private String cardDescription;
        @JsonProperty("cardExpiryDate")
        private String cardExpiryDate;
        @JsonProperty("withdrawalAccountNo")
        private String withdrawalAccountNo;
        @JsonProperty("withdrawalDate")
        private String withdrawalDate;
    }
}

