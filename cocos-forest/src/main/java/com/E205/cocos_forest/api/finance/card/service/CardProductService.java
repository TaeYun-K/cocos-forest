package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardProductOut;

import java.util.List;

public interface CardProductService {
    // 전체 카드 상품 조회 (DB에는 issuer=1001만 저장됨)
    List<CardProductOut> getAll();
}
