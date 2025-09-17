package com.E205.cocos_forest.global.external.ssafy.client.api;

import com.E205.cocos_forest.global.external.ssafy.dto.result.CreditCardCreateResult;

public interface CardClient {
    CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate);
}
