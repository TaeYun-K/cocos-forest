package com.E205.cocos_forest.global.external.ssafy;

import com.E205.cocos_forest.global.external.ssafy.client.api.AccountClient;
import com.E205.cocos_forest.global.external.ssafy.client.api.CardClient;
import com.E205.cocos_forest.global.external.ssafy.client.api.MemberClient;
import com.E205.cocos_forest.global.external.ssafy.dto.result.AccountCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SsafyHttpGateway implements SsafyGateway {

    private final MemberClient memberClient;
    private final AccountClient accountClient;
    private final CardClient cardClient;

    @Override
    public String registerAndGetUserKey(String userEmail) {
        return memberClient.registerAndGetUserKey(userEmail);
    }

    @Override
    public boolean searchUser(String userEmail) {
        return memberClient.searchUser(userEmail);
    }

    @Override
    public AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo) {
        return accountClient.createDemandDepositAccount(userKey, accountTypeUniqueNo);
    }

    @Override
    public CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate) {
        return cardClient.createCreditCard(userKey, cardUniqueNo, withdrawalAccountNo, withdrawalDate);
    }
}

