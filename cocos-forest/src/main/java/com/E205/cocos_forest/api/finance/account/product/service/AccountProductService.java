package com.E205.cocos_forest.api.finance.account.product.service;

import com.E205.cocos_forest.api.finance.account.product.dto.out.AccountProductOut;

import java.util.List;

public interface AccountProductService {
    List<AccountProductOut> getAccountProductsByBankCode(String bankCode);
}
