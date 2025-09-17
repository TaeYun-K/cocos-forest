package com.E205.cocos_forest.api.finance.card.dto.out;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CardProductOut {
    private Long productId;
    private String issuerCode;
    private String cardUniqueNo;
    private String name;
    private String description;
    private Integer baselinePerformance;
    private Integer maxBenefitLimit;
}
