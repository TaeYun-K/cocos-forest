package com.E205.cocos_forest.api.finance.card.dto.out;

import com.E205.cocos_forest.domain.finance.card.UserCard;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CardLinkOut {
    private Long userCardId;
    private Long userId;
    private Long productId;
    private String cardUniqueNo;
    private String issuerCode;
    private String issuerName;
    private String cardName;
    private String cardNoMasked;
    private String last4;
    private String expiryYmd;
    private String withdrawalAccountNo;
    private String withdrawalDate;
    private Integer baselinePerformance;
    private Integer maxBenefitLimit;
    private String cardDescription;
    private UserCard.Status status;
}
