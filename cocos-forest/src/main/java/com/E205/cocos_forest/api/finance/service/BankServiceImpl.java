package com.E205.cocos_forest.api.finance.service;

import com.E205.cocos_forest.api.finance.dto.out.BankOut;
import com.E205.cocos_forest.domain.bank.Bank;
import com.E205.cocos_forest.domain.bank.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BankServiceImpl implements BankService {

    private final BankRepository bankRepository;

    @Override
    public List<BankOut> getAllBanks() {
        List<Bank> banks = bankRepository.findAllByOrderByBankNameAsc();
        return banks.stream()
                .map(bank -> BankOut.builder()
                        .bankCode(bank.getBankCode())
                        .bankName(bank.getBankName())
                        .build())
                .toList();
    }
}
