package com.E205.cocos_forest.global.external.ssafy.client.http;

import com.E205.cocos_forest.global.external.ssafy.client.api.MemberClient;
import com.E205.cocos_forest.global.external.ssafy.config.SsafyProperties;
import com.E205.cocos_forest.global.external.ssafy.dto.request.MemberRegisterRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.request.MemberSearchRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.MemberRegisterResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.response.MemberSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemberHttpClient implements MemberClient {

    @Qualifier("ssafyWebClient")
    private final WebClient webClient;
    private final SsafyProperties props;

    @Override
    public String registerAndGetUserKey(String userEmail) {
        var req = new MemberRegisterRequest(props.getApiKey(), userEmail);
        var res = webClient.post()
                .uri("/member")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(MemberRegisterResponse.class)
                .block();

        if (res == null || res.getUserKey() == null || res.getUserKey().isBlank()) {
            log.error("Register response missing userKey for userEmail={}", userEmail);
            throw new RuntimeException("SSAFY register failed: missing userKey");
        }
        return res.getUserKey();
    }

    @Override
    public boolean searchUser(String userEmail) {
        var req = new MemberSearchRequest(props.getApiKey(), userEmail);
        var res = webClient.post()
                .uri("/member/search")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(MemberSearchResponse.class)
                .block();

        return res != null && res.getUserKey() != null && !res.getUserKey().isBlank();
    }
}

