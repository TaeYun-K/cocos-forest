package com.E205.cocos_forest.api.finance.bank.service;

import com.E205.cocos_forest.api.finance.bank.dto.out.BankOut;

import java.util.List;

public interface BankService {
    List<BankOut> getAllBanks();
}
