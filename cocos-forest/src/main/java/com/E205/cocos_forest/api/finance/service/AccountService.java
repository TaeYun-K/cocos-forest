package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.in.AccountCreateIn;
import com.E205.cocos_forest.api.finance.dto.out.AccountCreateOut;
import com.E205.cocos_forest.api.finance.dto.out.UserAccountOut;

import java.util.List;

public interface AccountService {
    AccountCreateOut createDemandDepositAccount(AccountCreateIn request);
    List<UserAccountOut> getUserAccounts(Long userId);
}
