package com.E205.cocos_forest.global.external.ssafy.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.List;

@Getter
public class CreditCardListResponse {
    @JsonProperty("Header")
    private AccountCreateResponse.AccountCreateHeader header;

    @JsonProperty("REC")
    private List<Rec> rec;

    @Getter
    public static class Rec {
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

