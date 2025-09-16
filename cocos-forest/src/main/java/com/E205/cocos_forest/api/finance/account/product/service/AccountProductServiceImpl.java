package com.E205.cocos_forest.api.finance.account.product.service;

import com.E205.cocos_forest.api.finance.account.product.dto.out.AccountProductOut;
import com.E205.cocos_forest.domain.finance.account.AccountProduct;
import com.E205.cocos_forest.domain.finance.account.AccountProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountProductServiceImpl implements AccountProductService {

    private final AccountProductRepository accountProductRepository;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public List<AccountProductOut> getAccountProductsByBankCode(String bankCode) {
        List<AccountProduct> products = accountProductRepository.findByBankBankCodeOrderByAccountNameAsc(bankCode);
        return products.stream()
                .map(this::convertToOut)
                .toList();
    }

    private AccountProductOut convertToOut(AccountProduct product) {
        return AccountProductOut.builder()
                .productId(product.getProductId())
                .accountTypeUniqueNo(product.getAccountTypeUniqueNo())
                .bankCode(product.getBank().getBankCode())
                .bankName(product.getBank().getBankName())
                .accountTypeCode(product.getAccountTypeCode())
                .accountTypeName(product.getAccountTypeName())
                .accountName(product.getAccountName())
                .accountDescription(product.getAccountDescription())
                .accountType(product.getAccountType())
                .createdAt(product.getCreatedAt().format(ISO))
                .build();
    }
}
