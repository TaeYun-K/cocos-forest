package com.E205.cocos_forest.domain.finance.account;

import com.E205.cocos_forest.domain.finance.bank.Bank;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "account_products",
       uniqueConstraints = { @UniqueConstraint(name = "uk_ddp_unique_no", columnNames = "account_type_unique_no") })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AccountProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "account_type_unique_no", nullable = false, length = 32)
    private String accountTypeUniqueNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_code", nullable = false)
    private Bank bank;

    @Column(name = "account_type_code", nullable = false, length = 5)
    private String accountTypeCode;

    @Column(name = "account_type_name", nullable = false, length = 50)
    private String accountTypeName;

    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    @Column(name = "account_description", nullable = false, length = 255)
    private String accountDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    @Builder.Default
    private AccountType accountType = AccountType.DOMESTIC;

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

    public enum AccountType {
        DOMESTIC, FOREIGN, ETC
    }
}
