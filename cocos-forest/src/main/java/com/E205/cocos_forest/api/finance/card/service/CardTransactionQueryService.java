package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardCategoryMonthlyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;

public interface CardTransactionQueryService {
    // Resolve default/owned card for authenticated user
    CardMonthlySummaryOut getMonthlySummaryForUser(Long userId, String yearMonth, String userCardId);
    CardDailyDetailsOut getDailyDetailsForUser(Long userId, String date, String userCardId);
    CardCategoryMonthlyDetailsOut getMonthlyTransactionsByCategoryForUser(Long userId, String yearMonth, String categoryId, String userCardId);
}
