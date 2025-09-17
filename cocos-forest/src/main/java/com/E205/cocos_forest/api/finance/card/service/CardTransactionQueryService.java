package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;

public interface CardTransactionQueryService {
    CardMonthlySummaryOut getMonthlySummary(String userCardId, String yearMonth);
    CardDailyDetailsOut getDailyDetails(String userCardId, String date);
    CardMonthlySummaryOut getMonthlySummaryByCategory(String userCardId, String yearMonth, String categoryId);
}
