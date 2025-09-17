package com.E205.cocos_forest.domain.email.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerification {

    @Id
    private String email;

    private String code;

    private LocalDateTime expiresAt;

    private LocalDateTime verifiedAt;

    @Builder
    public EmailVerification(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
        this.verifiedAt = null; // 처음 생성 시에는 인증되지 않았으므로 null
    }

    // 인증 코드, 만료 시간 업데이트 (재요청 시 사용)
    public void updateVerification(String code, LocalDateTime expiresAt) {
        this.code = code;
        this.expiresAt = expiresAt;
        this.verifiedAt = null; // 재요청이므로 인증 상태 초기화
    }

    // 인증 완료 처리
    public void setVerified() {
        this.verifiedAt = LocalDateTime.now();
    }
}