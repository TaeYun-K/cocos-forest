package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.domain.account.UserAccount;
import com.E205.cocos_forest.domain.account.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserAccountServiceImpl implements UserAccountService {

    private final UserAccountRepository userAccountRepository;

    @Override
    public UserAccount saveAccount(UserAccount userAccount) {
        return userAccountRepository.save(userAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAccount findByAccountNo(String accountNo) {
        return userAccountRepository.findByAccountNo(accountNo)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAccount> findByUserId(Long userId) {
        return userAccountRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
