package com.E205.cocos_forest.global.external.ssafy.dto.result;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCardTransactionCreateResult {
    private String transactionUniqueNo;
    private String categoryId;
    private String categoryName;
    private String merchantId; // SSAFY merchant id
    private String merchantName;
    private String transactionDate; // yyyyMMdd
    private String transactionTime; // HHmmss
    private String paymentBalance;  // as string from SSAFY
}

