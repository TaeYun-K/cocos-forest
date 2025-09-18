package com.E205.cocos_forest.global.config.security;

import com.E205.cocos_forest.global.jwt.JwtAuthenticationFilter;
import com.E205.cocos_forest.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests((requests) -> requests
                // 공개 접근 허용 경로들
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/test/public").permitAll()  // 테스트용 공개 엔드포인트

                // 인증/회원가입 관련 (인증 불필요)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/user/register", "/api/user/login").permitAll()

                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // 그 외 모든 API는 인증 필요
                .requestMatchers("/api/**").authenticated()

                // 기타 모든 요청 허용 (정적 리소스 등)
                .anyRequest().permitAll()
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}