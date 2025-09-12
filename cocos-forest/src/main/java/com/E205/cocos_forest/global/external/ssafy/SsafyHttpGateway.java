package com.E205.cocos_forest.global.external.ssafy;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@RequiredArgsConstructor
@Component
public class SsafyHttpGateway implements SsafyGateway {

    private final WebClient webClient;
    private final SsafyProperties props;

    @Override
    public String registerAndGetUserKey(String userEmail) {
        var req = new RegisterReq(props.getApiKey(), userEmail);
        var res = webClient.post()
            .uri(props.getBaseUrl() + "/member")
            .bodyValue(req)
            .retrieve()
            .bodyToMono(RegisterRes.class)
            .block();

        return res != null ? res.getUserKey() : null;
    }

    @Getter @AllArgsConstructor
    static class RegisterReq {
        private final String apiKey;
        private final String userId;
    }
    @Getter
    static class RegisterRes { private String responseCode; private String userKey; }
}
