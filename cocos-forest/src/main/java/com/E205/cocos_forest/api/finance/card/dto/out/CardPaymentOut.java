package com.E205.cocos_forest.api.finance.card.dto.out;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CardPaymentOut {
    private String transactionUniqueNo;
    private String categoryId;
    private String categoryName;
    private Long merchantId;
    private String merchantName;
    private String transactionDate; // yyyyMMdd
    private String transactionTime; // HHmmss
    private Long paymentBalance;
    private Long savedTransactionId; // our DB id
    private String status; // APPROVED
}

