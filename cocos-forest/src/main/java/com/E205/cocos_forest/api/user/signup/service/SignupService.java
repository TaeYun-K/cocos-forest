package com.E205.cocos_forest.api.user.signup.service;

import com.E205.cocos_forest.api.user.signup.dto.in.SignupRequestDto;
import com.E205.cocos_forest.api.user.signup.dto.out.SignupResponseDto;
import com.E205.cocos_forest.domain.email.repository.EmailVerificationRepository;
import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @Service: 이 클래스가 비즈니스 로직을 담당하는 서비스 계층임을 Spring에 알립니다.
 *
 * @RequiredArgsConstructor: final 키워드가 붙은 필드들을 자동으로 주입하는 생성자를 만들어줍니다. (@Autowired를 사용한 필드 주입보다 권장되는 방식입니다.)
 *
 * @Transactional: 이 어노테이션이 붙은 메서드 내의 모든 데이터베이스 작업은 하나의 트랜잭션으로 묶입니다. 중간에 예외가 발생하면 모든 작업이 롤백되어 데이터 정합성을 보장합니다.
 *
 * 로직 설명:
 * userRepository를 사용해 이메일과 닉네임이 이미 존재하는지 확인하고, 존재한다면 BaseException을 발생시킵니다.
 * emailVerificationRepository를 통해 해당 이메일이 인증되었는지 확인합니다. (verifiedAt 컬럼이 채워져 있는지) 인증되지 않았다면 예외를 발생시킵니다.
 *
 * 모든 검증을 통과하면, SignupRequestDto의 toEntity() 메서드를 호출하여 User 엔티티를 생성합니다.
 * 이 때 passwordEncoder를 넘겨주어 비밀번호를 암호화합니다.
 *
 * userRepository.save()를 통해 생성된 User 객체를 데이터베이스에 저장합니다.
 * 회원가입이 성공했으므로, 더 이상 필요 없는 이메일 인증 기록을 삭제합니다.
 * 저장된 User 엔티티를 SignupResponseDto로 변환하여 컨트롤러에 반환합니다.
 */
@Service
@RequiredArgsConstructor
public class SignupService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository; // 이메일 인증 확인용
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SignupResponseDto signup(SignupRequestDto requestDto) {
        // 1. 이메일 중복 확인
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new BaseException(BaseResponseStatus.DATABASE_CONSTRAINT_VIOLATION); // 혹은 이메일 중복 전용 에러 코드 생성
        }

        // 2. 닉네임 중복 확인
        if (userRepository.existsByNickname(requestDto.getNickname())) {
            throw new BaseException(BaseResponseStatus.NICKNAME_DUPLICATION);
        }

        // 3. (필수) 이메일 인증 여부 확인
        var emailVerification = emailVerificationRepository.findById(requestDto.getEmail())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.EMAIL_VERIFICATION_NOT_FOUND));

        if (emailVerification.getVerifiedAt() == null) {
            // 아직 인증되지 않은 이메일
            throw new BaseException(BaseResponseStatus.EMAIL_NOT_VERIFIED);
        }

        // 4. User 객체 생성 및 저장
        User user = requestDto.toEntity(passwordEncoder);
        User savedUser = userRepository.save(user);

        // 5. 인증 완료된 이메일 정보 삭제
        emailVerificationRepository.delete(emailVerification);

        // 6. 응답 DTO로 변환하여 반환
        return SignupResponseDto.from(savedUser);
    }
}