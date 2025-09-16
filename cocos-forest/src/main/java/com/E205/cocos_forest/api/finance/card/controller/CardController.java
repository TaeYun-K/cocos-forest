package com.E205.cocos_forest.api.finance.card.controller;

import com.E205.cocos_forest.api.finance.card.dto.in.CardLinkCreateIn;
import com.E205.cocos_forest.api.finance.card.dto.out.CardLinkOut;
import com.E205.cocos_forest.api.finance.card.service.UserCardService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "카드 연동 API", description = "사용자 카드 연동")
@RestController
@RequestMapping("/api/finance/cards")
@RequiredArgsConstructor
public class CardController {

    private final UserCardService userCardService;

    @Operation(summary = "카드 연결", description = "선택한 카드 상품을 SSAFY에 생성/연동하고 저장")
    @PostMapping("/link")
    public BaseResponse<CardLinkOut> link(@RequestBody @Valid CardLinkCreateIn in) {
        return new BaseResponse<>(userCardService.linkCard(in));
    }
}
