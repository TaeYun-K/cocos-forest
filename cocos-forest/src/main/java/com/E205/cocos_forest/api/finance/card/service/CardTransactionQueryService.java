package com.E205.cocos_forest.api.finance.card.service;

import com.E205.cocos_forest.api.finance.card.dto.out.CardMonthlySummaryOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardCategoryMonthlyDetailsOut;
import com.E205.cocos_forest.api.finance.card.dto.out.CardDailyDetailsOut;

public interface CardTransactionQueryService {
    // Resolves default/owned card internally based on userId
    CardMonthlySummaryOut getMonthlySummaryForUser(Long userId, String yearMonth);
    CardDailyDetailsOut getDailyDetailsForUser(Long userId, String date);
    CardCategoryMonthlyDetailsOut getMonthlyTransactionsByCategoryForUser(Long userId, String yearMonth, String categoryId);
}
