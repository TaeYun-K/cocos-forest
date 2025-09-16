package com.E205.cocos_forest.api.finance.account.product.controller;

import com.E205.cocos_forest.api.finance.account.product.dto.out.AccountProductOut;
import com.E205.cocos_forest.api.finance.account.product.service.AccountProductService;
import com.E205.cocos_forest.global.response.BaseResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Tag(name = "계좌 상품 API", description = "계좌 상품 조회 관련 API")
@RestController
@RequestMapping("/api/finance/account-products")
@RequiredArgsConstructor
public class AccountProductController {

    private final AccountProductService accountProductService;


    @Operation(summary = "특정 은행의 입출금 상품 목록 조회", description = "은행 코드를 받아 해당 은행의 모든 입출금 상품의 목록을 조회합니다.")
    @GetMapping("/banks/{bankCode}")
    public BaseResponse<List<AccountProductOut>> getAccountProductsByBankCode(
            @PathVariable String bankCode) {
        List<AccountProductOut> products = accountProductService.getAccountProductsByBankCode(bankCode);
        return new BaseResponse<>(products);
    }
}
