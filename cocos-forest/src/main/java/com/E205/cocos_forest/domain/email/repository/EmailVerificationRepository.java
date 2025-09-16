package com.E205.cocos_forest.domain.email.repository;

import com.E205.cocos_forest.domain.email.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
    // JpaRepository<EmailVerification, String> 에서 두 번째 타입은 PK의 타입입니다.
    // email(PK)의 타입이 String이므로 String을 사용합니다.
}
