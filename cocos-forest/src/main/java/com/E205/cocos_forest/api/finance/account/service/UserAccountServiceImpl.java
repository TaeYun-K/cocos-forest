package com.E205.cocos_forest.api.finance.account.service;

import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;
import com.E205.cocos_forest.domain.finance.account.UserAccount;
import com.E205.cocos_forest.domain.finance.account.UserAccountRepository;
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
    public List<UserAccountOut> findByUserId(String userId) {
        return List.of();
    }

    @Transactional(readOnly = true)
    @Override
    public List<UserAccount> findByUserId(Long userId) {
        return userAccountRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
