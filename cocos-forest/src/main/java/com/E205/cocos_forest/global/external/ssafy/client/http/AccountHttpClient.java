package com.E205.cocos_forest.global.external.ssafy.client.http;

import com.E205.cocos_forest.global.external.ssafy.client.api.AccountClient;
import com.E205.cocos_forest.global.external.ssafy.dto.request.AccountCreateRequest;
import com.E205.cocos_forest.global.external.ssafy.dto.response.AccountCreateResponse;
import com.E205.cocos_forest.global.external.ssafy.dto.result.AccountCreateResult;
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
public class AccountHttpClient implements AccountClient {

    @Qualifier("ssafyWebClient")
    private final WebClient webClient;
    private final SsafyHeaderFactory headerFactory;

    @Override
    public AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo) {
        SsafyHeader header = headerFactory.create(
                "createDemandDepositAccount",
                "createDemandDepositAccount",
                userKey
        );

        var req = new AccountCreateRequest(header, accountTypeUniqueNo);

        var res = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .pathSegment("edu", "demandDeposit", "createDemandDepositAccount")
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(AccountCreateResponse.class)
                .block();

        if (res == null || res.getRec() == null) {
            log.error("Account create response empty");
            return null;
        }

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
}

