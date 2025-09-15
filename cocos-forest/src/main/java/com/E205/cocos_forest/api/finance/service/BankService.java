package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.out.BankOut;

import java.util.List;

public interface BankService {
    List<BankOut> getAllBanks();
}
