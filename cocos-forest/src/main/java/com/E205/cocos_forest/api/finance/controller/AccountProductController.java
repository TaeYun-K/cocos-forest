package com.E205.cocos_forest.api.finance.controller;

import com.E205.cocos_forest.api.finance.dto.out.AccountProductOut;
import com.E205.cocos_forest.api.finance.service.AccountProductService;
import com.E205.cocos_forest.global.response.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/account-products")
@RequiredArgsConstructor
public class AccountProductController {

    private final AccountProductService accountProductService;

    /**
     * 특정 은행의 입출금 상품 목록 조회
     * 계좌명 기준 오름차순 정렬
     */
    @GetMapping("/banks/{bankCode}")
    public BaseResponse<List<AccountProductOut>> getAccountProductsByBankCode(
            @PathVariable String bankCode) {
        List<AccountProductOut> products = accountProductService.getAccountProductsByBankCode(bankCode);
        return new BaseResponse<>(products);
    }
}
