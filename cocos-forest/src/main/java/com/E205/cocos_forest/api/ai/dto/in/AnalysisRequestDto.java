package com.E205.cocos_forest.api.ai.dto.in;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
public class AnalysisRequestDto {

    private TotalsDto totals;
    private List<TransactionDto> transactions;

    @Getter
    @NoArgsConstructor
    @ToString
    public static class TotalsDto {
        private Double carbonTotalKg;
    }

    @Getter
    @NoArgsConstructor
    @ToString
    public static class TransactionDto {
        private String merchantName;
        private Integer amountKrw;
        private String categoryName;
        private LocalDateTime approvedAt;
    }
}