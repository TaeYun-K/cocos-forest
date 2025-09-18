package com.E205.cocos_forest.global.external.ssafy.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class AccountCreateResponse {
    @JsonProperty("Header")
    private AccountCreateHeader header;

    @JsonProperty("REC")
    private AccountCreateRec rec;

    @Getter
    public static class AccountCreateHeader {
        @JsonProperty("responseCode")
        private String responseCode;

        @JsonProperty("responseMessage")
        private String responseMessage;
    }

    @Getter
    public static class AccountCreateRec {
        @JsonProperty("bankCode")
        private String bankCode;

        @JsonProperty("accountNo")
        private String accountNo;

        @JsonProperty("currency")
        private AccountCreateCurrency currency;
    }

    @Getter
    public static class AccountCreateCurrency {
        @JsonProperty("currency")
        private String currency;

        @JsonProperty("currencyName")
        private String currencyName;
    }
}

