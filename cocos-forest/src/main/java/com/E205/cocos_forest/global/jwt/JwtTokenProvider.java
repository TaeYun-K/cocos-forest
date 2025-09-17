package com.E205.cocos_forest.global.jwt;

import com.E205.cocos_forest.domain.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
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

    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
                            @Value("${jwt.access-token-validity-in-seconds}") long accessTokenValidity,
                            @Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidity) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenValidityInMilliseconds = accessTokenValidity * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidity * 1000;
    }

    /**
     * Access Token과 Refresh Token을 생성합니다.
     *
     * @param authentication 인증 정보
     * @param user           사용자 엔티티
     * @return 생성된 토큰 정보를 담은 TokenInfo 객체
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

    // Refresh Token 생성 로직 (사용자 정보 없이, 만료 시간만 포함)
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

    // JWT 토큰을 복호화하여 토큰에 들어있는 정보를 꺼내는 메서드
    public Authentication getAuthentication(String accessToken) {
        Claims claims = parseClaims(accessToken);

        Collection<? extends GrantedAuthority> authorities;
        if (claims.get("auth") == null) {
            authorities = Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            authorities = Arrays.stream(claims.get("auth").toString().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
        }

        UserDetails principal = new org.springframework.security.core.userdetails.User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }
    
    // 토큰 정보를 검증하는 메서드
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
     * @param token 검사할 토큰
     * @return 남은 만료 시간 (밀리초 단위)
     */
    public Long getExpiration(String token) {
        Date expiration = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getExpiration();
        long now = new Date().getTime();
        return (expiration.getTime() - now);
    }
}