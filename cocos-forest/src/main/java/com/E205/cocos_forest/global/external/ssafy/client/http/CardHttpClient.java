package com.E205.cocos_forest.global.external.ssafy.client.http;

import com.E205.cocos_forest.global.external.ssafy.client.api.CardClient;
import com.E205.cocos_forest.global.external.ssafy.dto.request.CreditCardCreateRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.CreditCardCreateResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
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

        var res = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .pathSegment("edu", "creditCard", "createCreditCard")
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
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
}

