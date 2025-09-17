package com.E205.cocos_forest.domain.finance.card;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_cards",
       uniqueConstraints = { @UniqueConstraint(name = "uk_user_card", columnNames = {"user_id", "card_unique_no"}) })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_card_id")
    private Long userCardId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private CardProduct product;

    @Column(name = "card_unique_no", nullable = false, length = 64)
    private String cardUniqueNo;

    @Column(name = "issuer_code", nullable = false, length = 10)
    private String issuerCode;

    @Column(name = "issuer_name", length = 50)
    private String issuerName;

    @Column(name = "card_name", length = 100)
    private String cardName;

    @Column(name = "card_no_masked", nullable = false, length = 32)
    private String cardNoMasked;

    @Column(name = "last4", nullable = false, length = 4)
    private String last4;

    @Column(name = "expiry_ymd", nullable = false, length = 8)
    private String expiryYmd;

    @Column(name = "withdrawal_account_no", nullable = false, length = 32)
    private String withdrawalAccountNo;

    @Column(name = "withdrawal_day", nullable = false)
    private Byte withdrawalDay;

    @Column(name = "baseline_performance")
    private Integer baselinePerformance;

    @Column(name = "max_benefit_limit")
    private Integer maxBenefitLimit;

    @Column(name = "card_description", length = 255)
    private String cardDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status { ACTIVE, INACTIVE }
}
