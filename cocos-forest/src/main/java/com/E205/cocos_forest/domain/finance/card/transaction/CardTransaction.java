package com.E205.cocos_forest.domain.finance.card.transaction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "card_transactions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_card_tx_user_txno", columnNames = {"user_id", "transaction_no"})
    },
    indexes = {
        @Index(name = "idx_card_tx_category", columnList = "category_id"),
        @Index(name = "idx_card_tx_user_date", columnList = "user_id, tx_date"),
        @Index(name = "fk_card_tx_merchant", columnList = "merchant_id")
    })
@Getter
@Setter
@NoArgsConstructor
public class CardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false, length = 32)
    private String categoryId;

    @Column(name = "transaction_no", nullable = false, length = 64)
    private String transactionNo;

    @Column(name = "card_last4", length = 32)
    private String cardLast4;

    @Column(name = "issue_code", length = 10)
    private String issueCode;

    @Column(name = "card_name", length = 100)
    private String cardName;

    @Column(name = "merchant_id")
    private Long merchantId;

    @Column(name = "tx_date", nullable = false)
    private LocalDate txDate;

    @Column(name = "tx_time")
    private LocalTime txTime;

    @Column(name = "amount_krw", nullable = false)
    private Long amountKrw;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.APPROVED;

    @Column(name = "raw_response", columnDefinition = "json")
    private String rawResponse;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        APPROVED,
        CANCELED,
        PENDING,
        OTHER
    }
}
