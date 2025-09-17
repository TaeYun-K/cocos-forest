package com.E205.cocos_forest.api.finance.card.controller;

import com.E205.cocos_forest.api.finance.card.dto.out.CardProductOut;
import com.E205.cocos_forest.api.finance.card.service.CardProductService;
import com.E205.cocos_forest.global.response.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "카드 상품 api", description = "연결 가능한 카드 상품 조회")
@RestController
@RequestMapping("/api/finance/card-products")
@RequiredArgsConstructor
public class CardProductController {

    private final CardProductService cardProductService;

    @Operation(summary = "카드 상품 목록", description = "전체 카드 상품 반환")
    @GetMapping
    public BaseResponse<List<CardProductOut>> list() {
        return new BaseResponse<>(cardProductService.getAll());
    }
}
