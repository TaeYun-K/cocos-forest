package com.E205.cocos_forest.global.jwt;

import com.E205.cocos_forest.domain.user.entity.User;
import com.E205.cocos_forest.domain.user.repository.UserRepository;
import com.E205.cocos_forest.global.config.security.CustomUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final UserRepository userRepository;

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
        @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidity,
        @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidity,
        UserRepository userRepository) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenValidityInMilliseconds = accessTokenValidity * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidity * 1000;
        this.userRepository = userRepository;
    }

    /**
     * Access Token과 Refresh Token을 생성합니다.
     */
    public TokenInfo generateToken(Authentication authentication, User user) {
        String accessToken = createAccessToken(authentication, user.getId());
        String refreshToken = createRefreshToken(authentication);

        return TokenInfo.builder()
            .grantType("Bearer")
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .build();
    }

    // Access Token 생성 로직
    private String createAccessToken(Authentication authentication, Long userId) {
        String authorities = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

        long now = (new Date()).getTime();
        Date accessTokenExpiresIn = new Date(now + accessTokenValidityInMilliseconds);

        return Jwts.builder()
            .setSubject(authentication.getName()) // payload "sub": "user@example.com"
            .claim("userId", userId)           // payload "userId": 1
            .claim("auth", authorities)        // payload "auth": "ROLE_USER"
            .setIssuedAt(new Date(now))
            .setExpiration(accessTokenExpiresIn)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    // Refresh Token 생성 로직
    private String createRefreshToken(Authentication authentication) {
        long now = (new Date()).getTime();
        Date refreshTokenExpiresIn = new Date(now + refreshTokenValidityInMilliseconds);

        return Jwts.builder()
            .setSubject(authentication.getName())
            .setIssuedAt(new Date(now))
            .setExpiration(refreshTokenExpiresIn)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * JWT 토큰에서 인증 정보를 가져와 CustomUserDetails를 포함한 Authentication 반환
     */
    public Authentication getAuthentication(String accessToken) {
        try {
            Claims claims = parseClaims(accessToken);

            String email = claims.getSubject();
            log.debug("JWT 토큰에서 추출된 정보 - email: {}", email);
            if (email == null) {
                log.warn("JWT 토큰에 Subject(email) 정보가 없습니다.");
                return null;
            }
            // DB에서 사용자 조회
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                log.warn("JWT 토큰의 email({})에 해당하는 사용자를 찾을 수 없습니다.", email);
                return null;
            }

            // 권한 정보 파싱
            Collection<? extends GrantedAuthority> authorities = parseAuthorities(claims);

            // CustomUserDetails 생성
            CustomUserDetails userDetails = new CustomUserDetails(user);

            log.debug("CustomUserDetails 생성 완료 - userId: {}, email: {}", user.getId(), user.getEmail());

            return new UsernamePasswordAuthenticationToken(userDetails, "", authorities);

        } catch (Exception e) {
            log.error("JWT 토큰에서 인증 정보 추출 중 오류 발생", e);
            return null;
        }
    }

    /**
     * Claims에서 권한 정보 파싱
     */
    private Collection<? extends GrantedAuthority> parseAuthorities(Claims claims) {
        if (claims.get("auth") == null) {
            return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            return Arrays.stream(claims.get("auth").toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        }
    }

    /**
     * 토큰 정보를 검증하는 메서드
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT Token", e);
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT Token", e);
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT Token", e);
        } catch (IllegalArgumentException e) {
            log.info("JWT claims string is empty.", e);
        }
        return false;
    }

    private Claims parseClaims(String accessToken) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(accessToken).getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    /**
     * 토큰의 남은 만료 시간을 계산합니다.
     */
    public Long getExpiration(String token) {
        Date expiration = Jwts.parserBuilder().setSigningKey(key).build()
            .parseClaimsJws(token).getBody().getExpiration();
        long now = new Date().getTime();
        return (expiration.getTime() - now);
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("userId", Long.class);
    }
}