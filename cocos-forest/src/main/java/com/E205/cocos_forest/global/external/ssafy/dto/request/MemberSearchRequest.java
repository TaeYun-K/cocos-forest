package com.E205.cocos_forest.global.external.ssafy.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberSearchRequest {
    @JsonProperty("apiKey")
    private final String apiKey;

    @JsonProperty("userId")
    private final String userId;
}

