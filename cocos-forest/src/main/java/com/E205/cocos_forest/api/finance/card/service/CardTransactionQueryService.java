package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;

public interface CardTransactionQueryService {
    CardMonthlySummaryOut getMonthlySummary(String userCardId, String yearMonth);
}
