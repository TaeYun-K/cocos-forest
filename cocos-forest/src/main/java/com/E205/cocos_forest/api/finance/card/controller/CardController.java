package com.E205.cocos_forest.api.finance.card.controller;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.in.CardPaymentCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardCategoryMonthlyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardPaymentOut;
import com.E205.cocos_forest.api.finance.card.dto.out.UserCardOut;
import com.E205.cocos_forest.api.finance.card.service.CardTransactionQueryService;
import com.E205.cocos_forest.api.finance.card.service.UserCardService;
import com.E205.cocos_forest.api.finance.card.service.CardPaymentService;
import com.E205.cocos_forest.global.response.BaseResponse;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "카드 API", description = "카드 연결, 소비내역/탄소배출량 조회 API")
@RestController
@RequestMapping("/api/finance/user-cards")
@RequiredArgsConstructor
public class CardController {

    private final UserCardService userCardService;
    private final CardTransactionQueryService cardTransactionQueryService;
    private final CardPaymentService cardPaymentService;

    @Operation(summary = "카드 연결 api", description = "카드를 연결합니다.")
    @PostMapping
    public BaseResponse<CardLinkOut> link(@AuthenticationPrincipal CustomUserDetails principal,
                                          @RequestBody @Valid CardLinkCreateIn in) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(userCardService.linkCard(userId, in));
    }

    @Operation(summary = "월별 카드 사용 내역 조회 api", description = "한달 소비 내역 정보를 조회합니다.")
    @GetMapping("/transactions/monthly-summary")
    public BaseResponse<CardMonthlySummaryOut> getMonthlySummaryDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                        @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlySummaryForUser(userId, yearMonth));
    }

    @Operation(summary = "월별 카드 사용 내역 조회 api (카테고리별)", description = "카테고리별로 한달 소비 내역 정보를 조회합니다.")
    @GetMapping("/transactions/{categoryId}")
    public BaseResponse<CardCategoryMonthlyDetailsOut> getMonthlyTransactionsByCategoryDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                                               @PathVariable String categoryId,
                                                                                               @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlyTransactionsByCategoryForUser(userId, yearMonth, categoryId));
    }

    @Operation(summary = "일별 카드 사용 상세 내역 조회 api", description = "해당 일의 상세 소비 내역 정보를 조회합니다.")
    @GetMapping("/transactions/daily-details")
    public BaseResponse<CardDailyDetailsOut> getDailyDetailsDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                    @RequestParam String date) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getDailyDetailsForUser(userId, date));
    }

    @Operation(summary = "카드 결제 이벤트 생성 api", description = "SSAFY 결제 API 호출 후 내부 거래 저장")
    @PostMapping("/transactions/pay")
    public BaseResponse<CardPaymentOut> pay(@AuthenticationPrincipal CustomUserDetails principal,
                                            @RequestBody @Valid CardPaymentCreateIn in) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardPaymentService.pay(userId, in));
    }

    @Operation(summary = "연결된 카드 목록 조회", description = "사용자의 연결된 카드 목록을 조회합니다.")
    @GetMapping
    public BaseResponse<List<UserCardOut>> listMyCards(@AuthenticationPrincipal CustomUserDetails principal) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(userCardService.getUserCards(userId));
    }
}
