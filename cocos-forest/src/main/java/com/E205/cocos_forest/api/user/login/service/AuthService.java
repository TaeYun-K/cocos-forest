package com.E205.cocos_forest.api.user.login.service;

import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.exception.BaseException;
import com.E205.cocos_forest.global.jwt.JwtTokenProvider;
import com.E205.cocos_forest.global.jwt.TokenInfo;
import com.E205.cocos_forest.global.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final RedisTemplate<String, Object> redisTemplate;


    @Transactional
    public TokenInfo login(String email, String password) {
        // 1. email + password 기반으로 Authentication 객체 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(email, password);

        // 2. 실제 검증 (비밀번호 확인 등)
        Authentication authentication;
        // 2. 실제 검증 (비밀번호 확인 등) - try-catch 블록으로 감싸기
        try {
            authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        } catch (BadCredentialsException e) {
            // authenticate() 메소드에서 비밀번호가 일치하지 않을 때 BadCredentialsException 발생
            // 이 예외를 잡아서 우리가 정의한 커스텀 예외로 변환하여 던집니다.
            throw new BaseException(BaseResponseStatus.PASSWORD_NOT_MATCHED);
        }

        // 3. 인증 정보를 기반으로 User 엔티티 조회
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 4. JWT 토큰 생성
        TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication, user);

        // 5. Refresh Token을 Redis에 저장 (만료 시간과 함께)
        redisTemplate.opsForValue().set(
            "RT:" + authentication.getName(), // Key: "RT:user@example.com"
            tokenInfo.getRefreshToken(),      // Value: "refresh-token-string"
            jwtTokenProvider.getExpiration(tokenInfo.getRefreshToken()), // TTL
            TimeUnit.MILLISECONDS
        );

        return tokenInfo;
    }

    @Transactional
    public TokenInfo reissue(String refreshToken) {
        // 1. Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BaseException(BaseResponseStatus.INVALID_TOKEN);
        }

        // 2. Access Token에서 사용자 정보(email) 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken); // Refresh Token으로 Authentication 객체 생성

        // 3. Redis에서 저장된 Refresh Token 조회
        String redisRefreshToken = (String) redisTemplate.opsForValue().get("RT:" + authentication.getName());
        if (!StringUtils.hasText(redisRefreshToken) || !redisRefreshToken.equals(refreshToken)) {
            throw new BaseException(BaseResponseStatus.INVALID_TOKEN); // 저장된 토큰과 일치하지 않음
        }

        // 4. 새로운 토큰 생성
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication, user);

        // 5. Redis의 Refresh Token 정보 업데이트
        redisTemplate.opsForValue().set(
            "RT:" + authentication.getName(),
            tokenInfo.getRefreshToken(),
            jwtTokenProvider.getExpiration(tokenInfo.getRefreshToken()),
            TimeUnit.MILLISECONDS
        );

        return tokenInfo;
    }

    public void logout(String refreshToken) {
        // 1. Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BaseException(BaseResponseStatus.INVALID_TOKEN);
        }

        // 2. Refresh Token에서 사용자 정보(email) 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);

        // 3. Redis에 해당 Refresh Token이 있는지 확인
        String redisRefreshTokenKey = "RT:" + authentication.getName();
        redisTemplate.opsForValue().get(redisRefreshTokenKey);
        redisTemplate.delete(redisRefreshTokenKey);
    }
}