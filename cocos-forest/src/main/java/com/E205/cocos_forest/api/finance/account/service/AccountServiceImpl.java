package com.E205.cocos_forest.api.finance.account.service;

import com.E205.cocos_forest.api.finance.account.dto.in.AccountCreateIn;
import com.E205.cocos_forest.api.finance.account.dto.out.AccountCreateOut;
import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;
import com.E205.cocos_forest.domain.finance.account.UserAccount;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkage;
import com.E205.cocos_forest.domain.finance.ssafy.SsafyLinkageRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.external.ssafy.SsafyGateway;
import com.E205.cocos_forest.global.external.ssafy.dto.result.AccountCreateResult;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.E205.cocos_forest.domain.finance.bank.BankRepository;
import com.E205.cocos_forest.domain.finance.bank.Bank;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final SsafyGateway ssafyGateway;
    private final SsafyLinkageRepository ssafyLinkageRepository;
    private final com.E205.cocos_forest.api.finance.account.service.UserAccountService userAccountService;
    private final BankRepository bankRepository;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public AccountCreateOut createDemandDepositAccount(Long userId, AccountCreateIn request) {
        // 1) 현재 사용자의 SSAFY 연동 정보 조회
        SsafyLinkage linkage = ssafyLinkageRepository.findByUserId(userId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.LINKAGE_NOT_FOUND));

        if (linkage.getUserKey() == null || linkage.getUserKey().isBlank()) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR);
        }

        // 2) SSAFY API 호출하여 계좌 발급
        AccountCreateResult result = ssafyGateway.createDemandDepositAccount(
                linkage.getUserKey(), 
                request.getAccountTypeUniqueNo()
        );

        if (result == null) {
            throw new BaseException(BaseResponseStatus.EXTERNAL_API_ERROR);
        }

        // 3) 계좌 정보를 DB에 저장
        UserAccount userAccount = UserAccount.builder()
                .userId(userId)
                .accountNo(result.getAccountNo())
                .bankCode(result.getBankCode())
                .accountTypeUniqueNo(request.getAccountTypeUniqueNo())
                .currency(result.getCurrency().getCurrency())
                .currencyName(result.getCurrency().getCurrencyName())
                .status(UserAccount.AccountStatus.ACTIVE)
                .build();

        UserAccount savedAccount = userAccountService.saveAccount(userAccount);

        // 4) 응답 DTO 변환
        return AccountCreateOut.builder()
                .bankCode(savedAccount.getBankCode())
                .accountNo(savedAccount.getAccountNo())
                .currency(savedAccount.getCurrency())
                .currencyName(savedAccount.getCurrencyName())
                .createdAt(savedAccount.getCreatedAt().format(ISO))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAccountOut> getUserAccounts(Long userId) {
        List<UserAccount> accounts = userAccountService.findByUserId(userId);
        return accounts.stream()
                .map(this::convertToUserAccountOut)
                .toList();
    }

    private UserAccountOut convertToUserAccountOut(UserAccount account) {
        String bankName = bankRepository.findById(account.getBankCode())
                .map(Bank::getBankName)
                .orElse(null);
        return UserAccountOut.builder()
                .accountId(account.getAccountId())
                .userId(account.getUserId())
                .accountNo(account.getAccountNo())
                .bankCode(account.getBankCode())
                .bankName(bankName)
                .accountTypeUniqueNo(account.getAccountTypeUniqueNo())
                .currency(account.getCurrency())
                .currencyName(account.getCurrencyName())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt().format(ISO))
                .build();
    }
}
