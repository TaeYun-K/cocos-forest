package com.E205.cocos_forest.api.finance.controller;

import com.E205.cocos_forest.api.finance.dto.out.BankOut;
import com.E205.cocos_forest.api.finance.service.BankService;
import com.E205.cocos_forest.global.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/finance/banks")
@RequiredArgsConstructor
public class BankController {

    private final BankService bankService;

    /**
     * 은행 목록 조회
     * 은행명 기준 오름차순 정렬
     */
    @GetMapping
    public BaseResponse<List<BankOut>> getAllBanks() {
        List<BankOut> banks = bankService.getAllBanks();
        return new BaseResponse<>(banks);
    }
}
