package com.E205.cocos_forest.api.finance.account.controller;

import com.E205.cocos_forest.api.finance.account.dto.in.AccountCreateIn;
import com.E205.cocos_forest.api.finance.account.dto.out.AccountCreateOut;
import com.E205.cocos_forest.api.finance.account.dto.out.UserAccountOut;
import com.E205.cocos_forest.api.finance.account.service.AccountService;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;


@Tag(name = "계좌 API", description = "계좌 발급 및 조회 관련 API")
@RestController
@RequestMapping("/api/finance/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * 수시 입출금 계좌 발급
     */
    @Operation (summary = "수시 입출금 계좌 발급", description = "사용자 ID와 은행 코드, 계좌 상품 코드를 받아 수시 입출금 계좌를 발급합니다.")
    @PostMapping("/demand-deposit")
    public BaseResponse<AccountCreateOut> createDemandDepositAccount(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody @Valid AccountCreateIn request) {
        Long userId = principal.getUser().getId();
        AccountCreateOut result = accountService.createDemandDepositAccount(userId, request);
        return new BaseResponse<>(result);
    }

    /**
     * 사용자의 계좌 목록 조회
     */
    @Operation(summary = "사용자의 계좌 목록 조회", description = "사용자 ID를 받아 해당 사용자가 보유한 모든 계좌의 목록을 조회합니다.")
    @GetMapping("/user")
    public BaseResponse<List<UserAccountOut>> getUserAccounts(@AuthenticationPrincipal CustomUserDetails principal) {
        Long userId = principal.getUser().getId();
        List<UserAccountOut> accounts = accountService.getUserAccounts(userId);
        return new BaseResponse<>(accounts);
    }
}
