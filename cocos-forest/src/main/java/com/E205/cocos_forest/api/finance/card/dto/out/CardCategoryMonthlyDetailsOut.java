package com.E205.cocos_forest.api.finance.card.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardCategoryMonthlyDetailsOut {

    private String userCardId;
    private String yearMonth;
    private String categoryId;
    private String categoryName;
    @Builder.Default
    private String currency = "KRW";

    private Totals totals;
    private List<CardDailyDetailsOut.TransactionItem> transactions;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private long amountTotal;
        private BigDecimal carbonTotalKg;
        private long transactionCount;
    }
}

