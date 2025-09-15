package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.out.AccountProductOut;

import java.util.List;

public interface AccountProductService {
    List<AccountProductOut> getAccountProductsByBankCode(String bankCode);
}
