package com.E205.cocos_forest.api.finance.account.service;

import com.E205.cocos_forest.domain.finance.account.UserAccount;

import java.util.List;

public interface UserAccountService {
    UserAccount saveAccount(UserAccount userAccount);
    UserAccount findByAccountNo(String accountNo);
    List<UserAccount> findByUserId(Long userId);
}
