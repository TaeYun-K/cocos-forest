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
public class CardDailyDetailsOut {

    private String userCardId;
    private String date;
    @Builder.Default
    private String currency = "KRW";

    private Totals totals;
    private List<TransactionItem> transactions;
    private Meta meta;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private long amountTotal;
        private BigDecimal carbonTotalKg;
        private long transactionCount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionItem {
        private String externalTransactionId;
        private String approvedAt;
        private String txDate;
        private String txTime;
        private long amountKrw;
        private String status;
        private String merchantName;
        private String categoryId;
        private String categoryName;
        private String cardLast4;
        private String issuerCode;
        private String cardName;
        private String source;
        private BigDecimal carbonKg;
        private String carbonCoefId;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Meta {
        private boolean lockAcquired;
        private long durationMs;
        private int retry;
        private String error;
    }
}

