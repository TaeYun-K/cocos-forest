package com.E205.cocos_forest.api.finance.card.controller;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.in.CardPaymentCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardCategoryMonthlyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardPaymentOut;
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
    public BaseResponse<CardLinkOut> link(@RequestParam Long userId,
                                            @RequestBody @Valid CardLinkCreateIn in) {
        return new BaseResponse<>(userCardService.linkCard(userId, in));
    }

    @Operation(summary = "월별 카드 사용 내역 요약 조회 api", description = "특정 카드의 월별 사용 내역 요약을 조회합니다.")
    @GetMapping("/{userCardId}/transactions/monthly-summary")
    public BaseResponse<CardMonthlySummaryOut> getMonthlySummary(@AuthenticationPrincipal CustomUserDetails principal,
                                                                @PathVariable String userCardId,
                                                                @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlySummaryForUser(userId, yearMonth, userCardId));
    }

    // Default-card version (no userCardId in path)
    @GetMapping("/transactions/monthly-summary")
    public BaseResponse<CardMonthlySummaryOut> getMonthlySummaryDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                        @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlySummaryForUser(userId, yearMonth, null));
    }

    @Operation(summary = "월별 카드 사용 내역 조회 api (카테고리별)", description = "카테고리별로 한달 소비 내역 정보를 조회합니다.")
    @GetMapping("/{userCardId}/transactions/{categoryId}")
    public BaseResponse<CardCategoryMonthlyDetailsOut> getMonthlyTransactionsByCategory(@AuthenticationPrincipal CustomUserDetails principal,
                                                                                       @PathVariable String userCardId,
                                                                                       @PathVariable String categoryId,
                                                                                       @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlyTransactionsByCategoryForUser(userId, yearMonth, categoryId, userCardId));
    }

    // Default-card version (no userCardId in path)
    @GetMapping("/transactions/{categoryId}")
    public BaseResponse<CardCategoryMonthlyDetailsOut> getMonthlyTransactionsByCategoryDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                                               @PathVariable String categoryId,
                                                                                               @RequestParam String yearMonth) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getMonthlyTransactionsByCategoryForUser(userId, yearMonth, categoryId, null));
    }

    @Operation(summary = "일별 카드 상세 조회 api", description = "지정 일자의 카드 거래 상세와 합계를 조회합니다.")
    @GetMapping("/{userCardId}/transactions/daily-details")
    public BaseResponse<CardDailyDetailsOut> getDailyDetails(@AuthenticationPrincipal CustomUserDetails principal,
                                                            @PathVariable String userCardId,
                                                            @RequestParam String date) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getDailyDetailsForUser(userId, date, userCardId));
    }

    // Default-card version (no userCardId in path)
    @GetMapping("/transactions/daily-details")
    public BaseResponse<CardDailyDetailsOut> getDailyDetailsDefault(@AuthenticationPrincipal CustomUserDetails principal,
                                                                    @RequestParam String date) {
        Long userId = principal.getUser().getId();
        return new BaseResponse<>(cardTransactionQueryService.getDailyDetailsForUser(userId, date, null));
    }

    @Operation(summary = "카드 결제 이벤트 생성 api", description = "SSAFY 결제 API 호출 후 내부 거래 저장")
    @PostMapping("/{userCardId}/transactions/pay")
    public BaseResponse<CardPaymentOut> pay(@RequestParam Long userId,
                                            @PathVariable String userCardId,
                                            @RequestBody @Valid CardPaymentCreateIn in) {
        return new BaseResponse<>(cardPaymentService.pay(userId, userCardId, in));
    }
}
