package com.E205.cocos_forest.api.finance.account.service;

import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;
import com.E205.cocos_forest.domain.finance.account.UserAccount;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserAccountService {
    UserAccount saveAccount(UserAccount userAccount);
    UserAccount findByAccountNo(String userId);
    List<UserAccountOut> findByUserId(String userId);

    @Transactional(readOnly = true)
    List<UserAccount> findByUserId(Long userId);
}
