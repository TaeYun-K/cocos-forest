package com.E205.cocos_forest.global.external.ssafy.client.api;

import com.E205.cocos_forest.global.external.ssafy.dto.result.AccountCreateResult;

public interface AccountClient {
    AccountCreateResult createDemandDepositAccount(String userKey, String accountTypeUniqueNo);
}
