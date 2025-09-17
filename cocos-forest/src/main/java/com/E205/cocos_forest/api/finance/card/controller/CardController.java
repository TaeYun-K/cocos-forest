package com.E205.cocos_forest.api.finance.card.controller;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;
import com.E205.cocos_forest.api.finance.card.service.CardTransactionQueryService;
import com.E205.cocos_forest.api.finance.card.service.UserCardService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "카드 API", description = "카드 연결, 소비내역/탄소배출량 조회 API")
@RestController
@RequestMapping("/api/finance/user-cards")
@RequiredArgsConstructor
public class CardController {

    private final UserCardService userCardService;
    private final CardTransactionQueryService cardTransactionQueryService;

    @Operation(summary = "카드 연결 api", description = "카드를 연결합니다.")
    @PostMapping
    public BaseResponse<CardLinkOut> link(@RequestBody @Valid CardLinkCreateIn in) {
        return new BaseResponse<>(userCardService.linkCard(in));
    }

    @Operation(summary = "월별 카드 사용 내역 요약 조회 api", description = "특정 카드의 월별 사용 내역 요약을 조회합니다.")
    @GetMapping("/{userCardId}/transactions/monthly-summary")
    public BaseResponse<CardMonthlySummaryOut> getMonthlySummary(@PathVariable String userCardId,
                                                                @RequestParam String yearMonth) {
        return new BaseResponse<>(cardTransactionQueryService.getMonthlySummary(userCardId, yearMonth));
    }

    @Operation(summary = "일별 카드 상세 조회 api", description = "지정 일자의 카드 거래 상세와 합계를 조회합니다.")
    @GetMapping("/{userCardId}/transactions/daily-details")
    public BaseResponse<CardDailyDetailsOut> getDailyDetails(@PathVariable String userCardId,
                                                             @RequestParam String date) {
        return new BaseResponse<>(cardTransactionQueryService.getDailyDetails(userCardId, date));
    }
}
