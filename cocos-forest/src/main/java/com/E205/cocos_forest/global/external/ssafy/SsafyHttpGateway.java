package com.E205.cocos_forest.global.external.ssafy;

import com.E205.cocos_forest.global.external.ssafy.client.api.AccountClient;
import com.E205.cocos_forest.global.external.ssafy.client.api.CardClient;
import com.E205.cocos_forest.global.external.ssafy.client.api.MemberClient;
import com.E205.cocos_forest.global.external.ssafy.dto.result.AccountCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardTransactionCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardListItem;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SsafyHttpGateway implements SsafyGateway {

    private final MemberClient memberClient;
    private final AccountClient accountClient;
    private final CardClient cardClient;

    // 사용자 등록 및 userKey 반환
    @Override
    public String registerAndGetUserKey(String userEmail) {
        return memberClient.registerAndGetUserKey(userEmail);
    }

    // 사용자 검색
    @Override
    public boolean searchUser(String userEmail) {
        return memberClient.searchUser(userEmail);
    }

    // 수시 입출금 계좌 발급
    @Override
    public AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo) {
        return accountClient.createDemandDepositAccount(userKey, accountTypeUniqueNo);
    }

    // 신용카드 연결
    @Override
    public CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate) {
        return cardClient.createCreditCard(userKey, cardUniqueNo, withdrawalAccountNo, withdrawalDate);
    }

    // 신용카드 결제하기
    @Override
    public CreditCardTransactionCreateResult createCreditCardTransaction(String userKey, String cardNo, String cvc, String merchantId, String paymentBalance) {
        return cardClient.createCreditCardTransaction(userKey, cardNo, cvc, merchantId, paymentBalance);
    }

    // 나와 연결된 신용카드 목록 조회 
    @Override
    public List<CreditCardListItem> inquireSignUpCreditCardList(String userKey) {
        return cardClient.inquireSignUpCreditCardList(userKey);
    }
}

