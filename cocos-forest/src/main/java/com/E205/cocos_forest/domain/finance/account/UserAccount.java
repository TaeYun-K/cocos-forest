package com.E205.cocos_forest.domain.finance.account;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_accounts",
       uniqueConstraints = { @UniqueConstraint(name = "uk_user_accounts_account_no", columnNames = "account_no") })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    // 우리 서비스의 사용자 PK (FK: users.id)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // SSAFY에서 발급받은 계좌번호
    @Column(name = "account_no", nullable = false, length = 20)
    private String accountNo;

    // 은행 코드
    @Column(name = "bank_code", nullable = false, length = 10)
    private String bankCode;

    // 계좌 유형 고유번호 (어떤 상품으로 발급받았는지)
    @Column(name = "account_type_unique_no", nullable = false, length = 32)
    private String accountTypeUniqueNo;

    // 통화 코드
    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    // 통화명
    @Column(name = "currency_name", nullable = false, length = 20)
    private String currencyName;

    // 계좌 상태 (ACTIVE, INACTIVE, SUSPENDED 등)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

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

    public enum AccountStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
