package com.E205.cocos_forest.global.external.ssafy.dto.result;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditCardCreateResult {
    private String cardNo;
    private String cvc;
    private String cardUniqueNo;
    private String cardIssuerCode;
    private String cardIssuerName;
    private String cardName;
    private Integer baselinePerformance;
    private Integer maxBenefitLimit;
    private String cardDescription;
    private String cardExpiryDate;
    private String withdrawalAccountNo;
    private String withdrawalDate;
}
