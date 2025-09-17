package com.E205.cocos_forest.api.finance.bank.controller;

import com.E205.cocos_forest.api.finance.bank.dto.out.BankOut;
import com.E205.cocos_forest.api.finance.bank.service.BankService;
import com.E205.cocos_forest.global.response.BaseResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@Tag(name = "은행 API", description = "은행 목록 조회 관련 API")
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
