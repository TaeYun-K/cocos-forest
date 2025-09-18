package com.E205.cocos_forest.api.finance.account.service;

import com.E205.cocos_forest.api.finance.account.dto.in.AccountCreateIn;
import com.E205.cocos_forest.api.finance.account.dto.out.AccountCreateOut;
import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;

import java.util.List;

public interface AccountService {
    AccountCreateOut createDemandDepositAccount(Long userId, AccountCreateIn request);
    List<UserAccountOut> getUserAccounts(Long userId);
}
