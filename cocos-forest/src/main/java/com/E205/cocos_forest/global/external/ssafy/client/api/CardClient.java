package com.E205.cocos_forest.global.external.ssafy.client.api;

import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardTransactionCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardListItem;
import java.util.List;

public interface CardClient {
    CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate);
    CreditCardTransactionCreateResult createCreditCardTransaction(String userKey, String cardNo, String cvc, String merchantId, String paymentBalance);
    List<CreditCardListItem> inquireSignUpCreditCardList(String userKey);
}
