package com.E205.cocos_forest.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티 (current_balance 추가)
 */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(nullable = false, length = 50, unique = true)
    private String nickname;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDateTime termsAgreedAt;

    @Column(nullable = false)
    private LocalDateTime privacyPolicyAgreedAt;

    private LocalDateTime marketingAgreedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "current_balance", nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long currentBalance = 0L; // 현재 포인트 잔액

    @Builder
    public User(String email, String nickname, String password, String phoneNumber,
                    LocalDateTime termsAgreedAt, LocalDateTime privacyPolicyAgreedAt,
                    LocalDateTime marketingAgreedAt, Role role, Long currentBalance) {
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.termsAgreedAt = termsAgreedAt;
        this.privacyPolicyAgreedAt = privacyPolicyAgreedAt;
        this.marketingAgreedAt = marketingAgreedAt;
        this.role = role != null ? role : Role.USER;
        this.currentBalance = currentBalance != null ? currentBalance : 0L;
    }

    /**
     * 포인트 잔액 업데이트 (직접 사용하지 말고 PointService 사용)
     */
    public void updateBalance(Long newBalance) {
        this.currentBalance = newBalance;
    }
}
