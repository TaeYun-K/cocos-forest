package com.E205.cocos_forest.global.external.ssafy.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class MemberRegisterResponse {
    @JsonProperty("userId")
    private String userId;

    @JsonProperty("userName")
    private String userName;

    @JsonProperty("institutionCode")
    private String institutionCode;

    @JsonProperty("userKey")
    private String userKey;

    @JsonProperty("created")
    private String created;

    @JsonProperty("modified")
    private String modified;
}

