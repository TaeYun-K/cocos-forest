// global/external/ssafy/SsafyGateway.java
package com.E205.cocos_forest.global.external.ssafy;

import com.E205.cocos_forest.global.external.ssafy.dto.AccountCreateResult;
import com.E205.cocos_forest.global.external.ssafy.dto.CreditCardCreateResult;

public interface SsafyGateway {
    // SSAFY에 사용자 등록(또는 조회) 호출, userKey 반환
    String registerAndGetUserKey(String userEmail);
    
    // SSAFY에서 사용자 검색, 존재 여부 확인
    boolean searchUser(String userEmail);
    
    // SSAFY에서 수시 입출금 계좌 발급
    AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo);

    // SSAFY에서 신용카드 발급(연결)
    CreditCardCreateResult createCreditCard(String userKey, String cardUniqueNo, String withdrawalAccountNo, String withdrawalDate);
}
