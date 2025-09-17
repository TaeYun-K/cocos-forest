package com.E205.cocos_forest.domain.finance.carbon;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "emission_factors",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_emission_factors_category", columnNames = {"category_id"})
    })
@Getter
@NoArgsConstructor
public class EmissionFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false, length = 32)
    private String categoryId;

    @Column(name = "factor", nullable = false, precision = 12, scale = 6)
    private BigDecimal factor;
}
