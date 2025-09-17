package com.E205.cocos_forest.domain.finance.card;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "card_products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CardProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "issuer_code", nullable = false, length = 10)
    private String issuerCode;

    @Column(name = "card_unique_no", nullable = false, length = 64)
    private String cardUniqueNo;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "baseline_performance")
    private Integer baselinePerformance;

    @Column(name = "max_benefit_limit")
    private Integer maxBenefitLimit;
}
