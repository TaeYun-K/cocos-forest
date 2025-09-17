package com.E205.cocos_forest.global.external.ssafy.dto.request;

import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeader;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccountCreateRequest {
    @JsonProperty("Header")
    private final SsafyHeader header;

    @JsonProperty("accountTypeUniqueNo")
    private final String accountTypeUniqueNo;
}

