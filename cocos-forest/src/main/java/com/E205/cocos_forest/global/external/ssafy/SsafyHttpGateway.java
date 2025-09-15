package com.E205.cocos_forest.global.external.ssafy;

import com.E205.cocos_forest.global.external.ssafy.dto.AccountCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.SsafyHeader;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
@Component
public class SsafyHttpGateway implements SsafyGateway {

    private final WebClient webClient;
    private final SsafyProperties props;
    private final SsafyHeaderFactory headerFactory;

    @Override
    public String registerAndGetUserKey(String userEmail) {
        log.info("=== SSAFY 사용자 등록 API 호출 시작 ===");
        log.info("userEmail: {}", userEmail);
        log.info("SSAFY API Key: {}", props.getApiKey());
        log.info("SSAFY Base URL: {}", props.getBaseUrl());
        log.info("요청 URL: {}", props.getBaseUrl() + "/member");
        
        var req = new RegisterReq(props.getApiKey(), userEmail);
        log.info("요청 객체: {}", req);
        
        try {
            var res = webClient.post()
                .uri(props.getBaseUrl() + "/member")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> {
                        log.error("SSAFY 등록 API 에러 응답: status={}", response.statusCode());
                        return response.bodyToMono(String.class)
                            .doOnNext(body -> log.error("에러 응답 본문: {}", body))
                            .then(Mono.error(new RuntimeException("SSAFY API 에러: " + response.statusCode())));
                    })
                .bodyToMono(String.class)
                .block();

            log.info("SSAFY 등록 API 원본 응답: {}", res);
            
            // JSON 파싱을 위해 ObjectMapper 사용
            if (res != null && !res.isEmpty()) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    var registerRes = mapper.readValue(res, RegisterRes.class);
                    log.info("파싱된 응답: userId={}, userName={}, userKey={}", 
                            registerRes.getUserId(), registerRes.getUserName(), registerRes.getUserKey());
                    
                    // userKey가 존재하면 등록 성공 (responseCode가 없으므로 userKey만 확인)
                    if (registerRes.getUserKey() != null && 
                        !registerRes.getUserKey().isEmpty()) {
                        log.info("사용자 등록 성공: userKey={}", registerRes.getUserKey());
                        return registerRes.getUserKey();
                    } else {
                        log.error("사용자 등록 실패: userKey가 없음");
                        throw new RuntimeException("사용자 등록 실패: userKey가 없음");
                    }
                } catch (Exception parseException) {
                    log.error("응답 파싱 실패: {}", parseException.getMessage());
                    throw new RuntimeException("응답 파싱 실패", parseException);
                }
            }
            
            log.error("응답이 비어있음");
            throw new RuntimeException("SSAFY API 응답이 비어있음");
            
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("SSAFY 등록 API HTTP 에러: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("SSAFY 등록 API 호출 실패: " + e.getStatusCode(), e);
        } catch (RuntimeException e) {
            // onStatus에서 던진 RuntimeException 처리
            log.error("SSAFY 등록 API 호출 중 RuntimeException 발생: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("SSAFY 등록 API 호출 실패", e);
            throw new RuntimeException("SSAFY 등록 API 호출 실패", e);
        }
    }

    @Override
    public boolean searchUser(String userEmail) {
        log.info("=== SSAFY 사용자 검색 API 호출 시작 ===");
        log.info("userEmail: {}", userEmail);
        log.info("SSAFY API Key: {}", props.getApiKey());
        log.info("SSAFY Base URL: {}", props.getBaseUrl());
        log.info("요청 URL: {}", props.getBaseUrl() + "/member/search");
        
        var req = new SearchReq(props.getApiKey(), userEmail);
        log.info("검색 요청 객체: {}", req);
        
        try {
            var res = webClient.post()
                .uri(props.getBaseUrl() + "/member/search")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> {
                        log.error("SSAFY API 에러 응답: status={}", response.statusCode());
                        return response.bodyToMono(String.class)
                            .doOnNext(body -> log.error("에러 응답 본문: {}", body))
                            .then(Mono.error(new RuntimeException("SSAFY API 에러: " + response.statusCode())));
                    })
                .bodyToMono(String.class)
                .block();

            log.info("SSAFY 검색 API 원본 응답: {}", res);
            
            // JSON 파싱을 위해 ObjectMapper 사용
            if (res != null && !res.isEmpty()) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    var searchRes = mapper.readValue(res, SearchRes.class);
                    log.info("파싱된 응답: userId={}, userName={}, userKey={}", 
                            searchRes.getUserId(), searchRes.getUserName(), searchRes.getUserKey());
                    
                    // userKey가 존재하면 사용자 존재 (responseCode가 없으므로 userKey만 확인)
                    boolean userExists = searchRes.getUserKey() != null && 
                                        !searchRes.getUserKey().isEmpty();
                    
                    log.info("사용자 존재 여부: {}", userExists);
                    return userExists;
                } catch (Exception parseException) {
                    log.error("응답 파싱 실패: {}", parseException.getMessage());
                    return false;
                }
            }
            
            log.warn("응답이 비어있음");
            return false;
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("SSAFY API HTTP 에러: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            // 400 Bad Request는 사용자가 존재하지 않음을 의미
            if (e.getStatusCode().value() == 400) {
                log.info("사용자가 존재하지 않음 (400 Bad Request)");
                return false;
            }
            return false;
        } catch (RuntimeException e) {
            // onStatus에서 던진 RuntimeException 처리
            log.error("SSAFY API 호출 중 RuntimeException 발생: {}", e.getMessage());
            // 400 에러는 사용자가 존재하지 않음을 의미
            if (e.getMessage().contains("400")) {
                log.info("사용자가 존재하지 않음 (RuntimeException - 400)");
                return false;
            }
            return false;
        } catch (Exception e) {
            log.error("SSAFY 검색 API 호출 실패", e);
            return false;
        }
    }

    @Override
    public AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo) {
        log.info("=== SSAFY 수시 입출금 계좌 발급 API 호출 시작 ===");
        log.info("userKey: {}", userKey);
        log.info("accountTypeUniqueNo: {}", accountTypeUniqueNo);
        
        // 헤더 생성
        SsafyHeader header = headerFactory.create(
            "createDemandDepositAccount",
            "createDemandDepositAccount", 
            userKey
        );
        
        var req = new AccountCreateReq(header, accountTypeUniqueNo);
        log.info("계좌 발급 요청 객체: {}", req);
        
        try {
            var res = webClient.post()
                .uri(uriBuilder -> uriBuilder
                    .pathSegment("edu", "demandDeposit", "createDemandDepositAccount")
                    .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                    response -> {
                        log.error("SSAFY 계좌 발급 API 에러 응답: status={}", response.statusCode());
                        return response.bodyToMono(String.class)
                            .doOnNext(body -> log.error("에러 응답 본문: {}", body))
                            .then(Mono.error(new RuntimeException("SSAFY API 에러: " + response.statusCode())));
                    })
                .bodyToMono(AccountCreateRes.class)
                .block();

            log.info("SSAFY 계좌 발급 API 응답: {}", res);
            
            if (res != null && res.getRec() != null) {
                var rec = res.getRec();
                return AccountCreateResult.builder()
                    .bankCode(rec.getBankCode())
                    .accountNo(rec.getAccountNo())
                    .currency(AccountCreateResult.Currency.builder()
                        .currency(rec.getCurrency().getCurrency())
                        .currencyName(rec.getCurrency().getCurrencyName())
                        .build())
                    .build();
            }
            
            log.error("계좌 발급 응답이 비어있음");
            return null;
            
        } catch (Exception e) {
            log.error("SSAFY 계좌 발급 API 호출 실패", e);
            return null;
        }
    }

    @Getter @AllArgsConstructor
    static class RegisterReq {
        @JsonProperty("apiKey")
        private final String apiKey;
        
        @JsonProperty("userId")
        private final String userId;
    }
    
    @Getter
    static class RegisterRes { 
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
    
    @Getter @AllArgsConstructor
    static class SearchReq {
        @JsonProperty("apiKey")
        private final String apiKey;
        
        @JsonProperty("userId")
        private final String userId;
    }
    
    @Getter
    static class SearchRes { 
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
    
    @Getter @AllArgsConstructor
    static class AccountCreateReq {
        @JsonProperty("Header")
        private final SsafyHeader header;
        
        @JsonProperty("accountTypeUniqueNo")
        private final String accountTypeUniqueNo;
    }
    
    @Getter
    static class AccountCreateRes {
        @JsonProperty("Header")
        private AccountCreateHeader header;
        
        @JsonProperty("REC")
        private AccountCreateRec rec;
    }
    
    @Getter
    static class AccountCreateHeader {
        @JsonProperty("responseCode")
        private String responseCode;
        
        @JsonProperty("responseMessage")
        private String responseMessage;
    }
    
    @Getter
    static class AccountCreateRec {
        @JsonProperty("bankCode")
        private String bankCode;
        
        @JsonProperty("accountNo")
        private String accountNo;
        
        @JsonProperty("currency")
        private AccountCreateCurrency currency;
    }
    
    @Getter
    static class AccountCreateCurrency {
        @JsonProperty("currency")
        private String currency;
        
        @JsonProperty("currencyName")
        private String currencyName;
    }
}
