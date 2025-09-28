package com.E205.cocos_forest.global.external.ssafy.client.http;

import com.E205.cocos_forest.global.external.ssafy.client.api.CardClient;
import com.E205.cocos_forest.global.external.ssafy.dto.request.CreditCardCreateRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.CreditCardCreateResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.request.CreditCardTransactionCreateRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.CreditCardTransactionCreateResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardTransactionCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.request.CreditCardListRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.CreditCardListResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardListItem;
import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeader;
import com.E205.cocos_forest.global.external.ssafy.header.SsafyHeaderFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class CardHttpClient implements CardClient {

    @Qualifier("ssafyWebClient")
    private final WebClient webClient;
    private final SsafyHeaderFactory headerFactory;

    @Override
    public CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate) {
        SsafyHeader header = headerFactory.create(
                "createCreditCard",
                "createCreditCard",
                userKey
        );

        var req = new CreditCardCreateRequest(header, cardUniqueNo, withdrawalAccountNo, withdrawalDate);

        // Debug request values (민감정보 없는 필드만 로깅)
        log.debug("[SSAFY] createCreditCard request - userKey={}, cardUniqueNo={}, withdrawalAccountNo={}, withdrawalDate={}",
                userKey, cardUniqueNo, withdrawalAccountNo, withdrawalDate);

        var res = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .pathSegment("edu", "creditCard", "createCreditCard")
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .doOnNext(body -> log.error("[SSAFY] createCreditCard error body: {}", body))
                                .flatMap(body -> reactor.core.publisher.Mono.error(new RuntimeException("SSAFY createCreditCard error: " + body)))
                )
                .bodyToMono(CreditCardCreateResponse.class)
                .block();

        if (res == null || res.getRec() == null) {
            log.error("Credit card create response empty");
            return null;
        }

        var r = res.getRec();
        return CreditCardCreateResult.builder()
                .cardNo(r.getCardNo())
                .cvc(r.getCvc())
                .cardUniqueNo(r.getCardUniqueNo())
                .cardIssuerCode(r.getCardIssuerCode())
                .cardIssuerName(r.getCardIssuerName())
                .cardName(r.getCardName())
                .baselinePerformance(parseIntSafe(r.getBaselinePerformance()))
                .maxBenefitLimit(parseIntSafe(r.getMaxBenefitLimit()))
                .cardDescription(r.getCardDescription())
                .cardExpiryDate(r.getCardExpiryDate())
                .withdrawalAccountNo(r.getWithdrawalAccountNo())
                .withdrawalDate(r.getWithdrawalDate())
                .build();
    }

    private Integer parseIntSafe(String s) {
        try { return s == null ? null : Integer.parseInt(s); } catch (Exception e) { return null; }
    }

    @Override
    public CreditCardTransactionCreateResult createCreditCardTransaction(String userKey, String cardNo, String cvc, String merchantId, String paymentBalance) {
        SsafyHeader header = headerFactory.create(
            "createCreditCardTransaction",
            "createCreditCardTransaction",
            userKey
        );

        var req = new CreditCardTransactionCreateRequest(header, cardNo, cvc, merchantId, paymentBalance);

        var res = webClient.post()
            .uri(uriBuilder -> uriBuilder
                .pathSegment("edu", "creditCard", "createCreditCardTransaction")
                .build())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(req)
            .retrieve()
            .bodyToMono(CreditCardTransactionCreateResponse.class)
            .block();

        if (res == null || res.getRec() == null) {
            log.error("Credit card transaction response empty");
            return null;
        }

        var r = res.getRec();
        return CreditCardTransactionCreateResult.builder()
            .transactionUniqueNo(r.getTransactionUniqueNo())
            .categoryId(r.getCategoryId())
            .categoryName(r.getCategoryName())
            .merchantId(r.getMerchantId())
            .merchantName(r.getMerchantName())
            .transactionDate(r.getTransactionDate())
            .transactionTime(r.getTransactionTime())
            .paymentBalance(r.getPaymentBalance())
            .build();
    }

    // 나와 연결된 신용카드 조회하기
    @Override
    public java.util.List<CreditCardListItem> inquireSignUpCreditCardList(String userKey) {
        SsafyHeader header = headerFactory.create(
            "inquireSignUpCreditCardList",
            "inquireSignUpCreditCardList",
            userKey
        );

        var req = new CreditCardListRequest(header);

        var res = webClient.post()
            .uri(uriBuilder -> uriBuilder
                .pathSegment("edu", "creditCard", "inquireSignUpCreditCardList")
                .build())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(req)
            .retrieve()
            .bodyToMono(CreditCardListResponse.class)
            .block();

        if (res == null || res.getRec() == null) {
            log.warn("Credit card list response empty");
            return java.util.Collections.emptyList();
        }

        return res.getRec().stream()
            .map(r -> CreditCardListItem.builder()
                .cardNo(r.getCardNo())
                .cvc(r.getCvc())
                .cardUniqueNo(r.getCardUniqueNo())
                .cardIssuerCode(r.getCardIssuerCode())
                .cardIssuerName(r.getCardIssuerName())
                .cardName(r.getCardName())
                .build())
            .toList();
    }
}
