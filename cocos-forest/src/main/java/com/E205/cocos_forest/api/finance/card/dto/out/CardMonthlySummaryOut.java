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
public class CardMonthlySummaryOut {

    private String userCardId;
    private String yearMonth;
    @Builder.Default
    private String currency = "KRW";
    private Totals totals;
    private List<Daily> daily;
    private List<CategoryBreakdown> byCategory;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private long amountTotal;
        private BigDecimal carbonTotalKg;
        private long transactionCount;
        private long daysActive;
        private long avgPerDayAmount;
        private BigDecimal avgPerDayCarbonKg;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Daily {
        private String date;
        private long amountTotal;
        private BigDecimal carbonTotalKg;
        private long transactionCount;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryId;
        private String categoryName;
        private long amountTotal;
        private BigDecimal carbonTotalKg;
        private BigDecimal ratioAmount;
        private BigDecimal ratioCarbon;
    }
}
