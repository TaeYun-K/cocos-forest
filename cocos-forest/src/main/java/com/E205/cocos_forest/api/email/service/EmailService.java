package com.E205.cocos_forest.api.email.service;

import com.E205.cocos_forest.api.email.dto.in.EmailSendRequestDto;
import com.E205.cocos_forest.api.email.dto.in.EmailVerifyRequestDto;
import com.E205.cocos_forest.domain.email.entity.EmailVerification;
import com.E205.cocos_forest.domain.email.repository.EmailVerificationRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final JavaMailSender mailSender;
    private static final long EXPIRATION_TIME_MINUTES = 3; // 인증코드 유효시간 3분
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 이메일 중복 확인
     * @param email 중복 확인할 이메일
     */
    @Transactional(readOnly = true)
    public void checkEmailDuplicate(String email) {
        if (emailVerificationRepository.existsByEmail(email)) {
            // 이미 이메일이 존재하면 예외 발생
            throw new BaseException(BaseResponseStatus.DATABASE_CONSTRAINT_VIOLATION);
        }
        // 존재하지 않으면 아무것도 하지 않고 성공적으로 메서드 종료
    }

    /**
     * 인증 코드 이메일 발송
     */
    @Transactional
    public void sendVerificationEmail(EmailSendRequestDto requestDto) {
        String email = requestDto.getEmail();
        String code = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRATION_TIME_MINUTES);

        // 이메일이 이미 존재하면 코드와 만료시간 업데이트, 없으면 새로 생성
        emailVerificationRepository.findById(email)
                .ifPresentOrElse(
                        verification -> verification.updateVerification(code, expiresAt),
                        () -> {
                            EmailVerification newVerification = EmailVerification.builder()
                                    .email(email)
                                    .code(code)
                                    .expiresAt(expiresAt)
                                    .build();
                            emailVerificationRepository.save(newVerification);
                        }
                );
        
        // 실제 이메일 발송
        sendEmail(email, "cocos forest 회원가입 인증 코드", "인증 코드는 [" + code + "] 입니다.");
    }
    
    /**
     * 이메일 인증 코드 검증
     */
    @Transactional
    public void verifyEmailCode(EmailVerifyRequestDto requestDto) {
        String email = requestDto.getEmail();
        String code = requestDto.getCode();

        // 1. 이메일로 인증 정보 조회
        EmailVerification verification = emailVerificationRepository.findById(email)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.EMAIL_VERIFICATION_NOT_FOUND));
        
        // 2. 시간 만료 여부 확인
        if (LocalDateTime.now().isAfter(verification.getExpiresAt())) {
            throw new BaseException(BaseResponseStatus.VERIFICATION_CODE_EXPIRED);
        }

        // 3. 인증 코드 일치 여부 확인
        if (!verification.getCode().equals(code)) {
            throw new BaseException(BaseResponseStatus.VERIFICATION_CODE_MISMATCH);
        }

        // 4. 인증 성공 처리 (verifiedAt 컬럼에 현재 시간 기록)
        verification.setVerified();
    }
    
    // 6자리 숫자 인증 코드 생성
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
    
    // 이메일 발송 로직
    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
        } catch (Exception e) {
            log.error("이메일 발송 실패. to: {}, subject: {}", to, subject, e);
        }
    }
}